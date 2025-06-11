import pool from "../config/db.js";

// Get all application stages
export const getAllStagesService = async () => {
    const result = await pool.query(
        "SELECT * FROM application_stages ORDER BY order_number"
    );
    return result.rows;
};

// Get a specific stage by ID
export const getStageByIdService = async (id) => {
    const result = await pool.query(
        "SELECT * FROM application_stages WHERE id = $1",
        [id]
    );
    return result.rows[0];
};

// Get stage requirements
export const getStageRequirementsService = async (stageId) => {
    const result = await pool.query(
        "SELECT * FROM stage_requirements WHERE stage_id = $1",
        [stageId]
    );
    return result.rows;
};

// Get application progress for a specific application
export const getApplicationProgressService = async (applicationId) => {
    const result = await pool.query(
        `SELECT ap.*, s.name as stage_name, s.description as stage_description, s.order_number
         FROM application_progress ap
         JOIN application_stages s ON ap.stage_id = s.id
         WHERE ap.application_id = $1
         ORDER BY s.order_number`,
        [applicationId]
    );
    return result.rows;
};

// Get current stage for an application
export const getCurrentStageService = async (applicationId) => {
    const result = await pool.query(
        `SELECT s.*, ap.status as progress_status, ap.started_at, ap.completed_at
         FROM applications a
         JOIN application_stages s ON a.current_stage_id = s.id
         LEFT JOIN application_progress ap ON ap.application_id = a.id AND ap.stage_id = a.current_stage_id
         WHERE a.id = $1`,
        [applicationId]
    );
    return result.rows[0];
};

// Get requirement completion status for an application
export const getRequirementCompletionService = async (applicationId, stageId = null) => {
    let query = `
        SELECT rc.*, sr.requirement_name, sr.requirement_type, sr.description, sr.is_mandatory,
               s.name as stage_name, s.order_number
        FROM requirement_completion rc
        JOIN stage_requirements sr ON rc.requirement_id = sr.id
        JOIN application_stages s ON sr.stage_id = s.id
        WHERE rc.application_id = $1
    `;
    
    const params = [applicationId];
    
    if (stageId) {
        query += " AND sr.stage_id = $2";
        params.push(stageId);
    }
    
    query += " ORDER BY s.order_number, sr.id";
    
    const result = await pool.query(query, params);
    return result.rows;
};

// Check if all requirements for a stage are completed
export const checkStageCompletionService = async (applicationId, stageId) => {
    // Get all mandatory requirements for the stage
    const mandatoryReqQuery = `
        SELECT COUNT(*) as total_mandatory
        FROM stage_requirements
        WHERE stage_id = $1 AND is_mandatory = true
    `;
    
    const mandatoryResult = await pool.query(mandatoryReqQuery, [stageId]);
    const totalMandatory = parseInt(mandatoryResult.rows[0].total_mandatory);
    
    // Get completed mandatory requirements
    const completedReqQuery = `
        SELECT COUNT(*) as completed_mandatory
        FROM requirement_completion rc
        JOIN stage_requirements sr ON rc.requirement_id = sr.id
        WHERE rc.application_id = $1 AND sr.stage_id = $2 
        AND sr.is_mandatory = true AND rc.status = 'completed'
    `;
    
    const completedResult = await pool.query(completedReqQuery, [applicationId, stageId]);
    const completedMandatory = parseInt(completedResult.rows[0].completed_mandatory);
    
    return {
        isComplete: completedMandatory >= totalMandatory,
        totalMandatory,
        completedMandatory
    };
};

// Update requirement completion status
export const updateRequirementStatusService = async (applicationId, requirementId, status, notes = null, referenceId = null, verifiedBy = null) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Update the requirement status
        const updateQuery = `
            UPDATE requirement_completion
            SET status = $1, 
                notes = $2,
                reference_id = $3,
                verified_by = $4,
                completed_at = CASE WHEN $1 = 'completed' THEN NOW() ELSE NULL END,
                updated_at = NOW()
            WHERE application_id = $5 AND requirement_id = $6
            RETURNING *
        `;
        
        const result = await client.query(updateQuery, [
            status, 
            notes, 
            referenceId, 
            verifiedBy, 
            applicationId, 
            requirementId
        ]);
        
        // Get the stage ID for this requirement
        const stageQuery = `
            SELECT stage_id 
            FROM stage_requirements 
            WHERE id = $1
        `;
        
        const stageResult = await client.query(stageQuery, [requirementId]);
        const stageId = stageResult.rows[0].stage_id;
        
        // Check if all requirements for this stage are completed
        const completionCheck = await checkStageCompletionService(applicationId, stageId);
        
        // If all requirements are completed, update the stage status
        if (completionCheck.isComplete) {
            await client.query(
                `UPDATE application_progress
                 SET status = 'completed', completed_at = NOW(), updated_at = NOW()
                 WHERE application_id = $1 AND stage_id = $2`,
                [applicationId, stageId]
            );
            
            // Get the next stage
            const nextStageQuery = `
                SELECT id 
                FROM application_stages 
                WHERE order_number > (
                    SELECT order_number 
                    FROM application_stages 
                    WHERE id = $1
                )
                ORDER BY order_number
                LIMIT 1
            `;
            
            const nextStageResult = await client.query(nextStageQuery, [stageId]);
            
            // If there's a next stage, update the application's current stage
            if (nextStageResult.rows.length > 0) {
                const nextStageId = nextStageResult.rows[0].id;
                
                // Update the application's current stage
                await client.query(
                    `UPDATE applications
                     SET current_stage_id = $1, updated_at = NOW()
                     WHERE id = $2`,
                    [nextStageId, applicationId]
                );
                
                // Create a progress entry for the next stage
                await client.query(
                    `INSERT INTO application_progress
                     (application_id, stage_id, status, started_at)
                     VALUES ($1, $2, 'in_progress', NOW())
                     ON CONFLICT (application_id, stage_id) DO UPDATE
                     SET status = 'in_progress', started_at = NOW(), updated_at = NOW()`,
                    [applicationId, nextStageId]
                );
            } else {
                // This was the final stage, mark the application as completed
                await client.query(
                    `UPDATE applications
                     SET status = 'completed', updated_at = NOW()
                     WHERE id = $1`,
                    [applicationId]
                );
            }
        }
        
        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Move an application to the next stage (admin function)
export const moveToNextStageService = async (applicationId, completedBy = null, notes = null) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // Get the current stage
        const currentStageQuery = `
            SELECT current_stage_id 
            FROM applications 
            WHERE id = $1
        `;
        
        const currentStageResult = await client.query(currentStageQuery, [applicationId]);
        
        if (!currentStageResult.rows.length || !currentStageResult.rows[0].current_stage_id) {
            throw new Error('Application has no current stage');
        }
        
        const currentStageId = currentStageResult.rows[0].current_stage_id;
        
        // Mark the current stage as completed
        await client.query(
            `UPDATE application_progress
             SET status = 'completed', 
                 completed_at = NOW(), 
                 completed_by = $1,
                 notes = $2,
                 updated_at = NOW()
             WHERE application_id = $3 AND stage_id = $4`,
            [completedBy, notes, applicationId, currentStageId]
        );
        
        // Get the next stage
        const nextStageQuery = `
            SELECT id 
            FROM application_stages 
            WHERE order_number > (
                SELECT order_number 
                FROM application_stages 
                WHERE id = $1
            )
            ORDER BY order_number
            LIMIT 1
        `;
        
        const nextStageResult = await client.query(nextStageQuery, [currentStageId]);
        
        // If there's a next stage, update the application's current stage
        if (nextStageResult.rows.length > 0) {
            const nextStageId = nextStageResult.rows[0].id;
            
            // Update the application's current stage
            await client.query(
                `UPDATE applications
                 SET current_stage_id = $1, updated_at = NOW()
                 WHERE id = $2`,
                [nextStageId, applicationId]
            );
            
            // Create a progress entry for the next stage
            await client.query(
                `INSERT INTO application_progress
                 (application_id, stage_id, status, started_at)
                 VALUES ($1, $2, 'in_progress', NOW())
                 ON CONFLICT (application_id, stage_id) DO UPDATE
                 SET status = 'in_progress', started_at = NOW(), updated_at = NOW()`,
                [applicationId, nextStageId]
            );
            
            await client.query('COMMIT');
            return { success: true, nextStageId };
        } else {
            // This was the final stage, mark the application as completed
            await client.query(
                `UPDATE applications
                 SET status = 'completed', updated_at = NOW()
                 WHERE id = $1`,
                [applicationId]
            );
            
            await client.query('COMMIT');
            return { success: true, completed: true };
        }
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Get applications by user ID with stage information
export const getUserApplicationsWithStagesService = async (userId) => {
    const query = `
        SELECT a.*, 
               s.name as current_stage_name, 
               s.order_number as current_stage_order,
               (
                   SELECT COUNT(*) 
                   FROM requirement_completion rc
                   JOIN stage_requirements sr ON rc.requirement_id = sr.id
                   WHERE rc.application_id = a.id 
                   AND sr.stage_id = a.current_stage_id 
                   AND rc.status = 'completed'
               ) as completed_requirements,
               (
                   SELECT COUNT(*) 
                   FROM stage_requirements sr
                   WHERE sr.stage_id = a.current_stage_id
               ) as total_requirements
        FROM applications a
        LEFT JOIN application_stages s ON a.current_stage_id = s.id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
};

// Get application details with stage information
export const getApplicationDetailsService = async (applicationId) => {
    const applicationQuery = `
        SELECT a.*, 
               s.name as current_stage_name, 
               s.description as current_stage_description,
               s.order_number as current_stage_order
        FROM applications a
        LEFT JOIN application_stages s ON a.current_stage_id = s.id
        WHERE a.id = $1
    `;
    
    const applicationResult = await pool.query(applicationQuery, [applicationId]);
    
    if (!applicationResult.rows.length) {
        return null;
    }
    
    const application = applicationResult.rows[0];
    
    // Get all stages and their progress
    const progressQuery = `
        SELECT s.id, s.name, s.description, s.order_number,
               ap.status as progress_status, ap.started_at, ap.completed_at, ap.notes
        FROM application_stages s
        LEFT JOIN application_progress ap ON ap.stage_id = s.id AND ap.application_id = $1
        ORDER BY s.order_number
    `;
    
    const progressResult = await pool.query(progressQuery, [applicationId]);
    application.stages = progressResult.rows;
    
    // Get requirements for the current stage
    if (application.current_stage_id) {
        const requirementsQuery = `
            SELECT sr.id, sr.requirement_name, sr.requirement_type, sr.description, sr.is_mandatory,
                   rc.status, rc.completed_at, rc.notes, rc.reference_id
            FROM stage_requirements sr
            LEFT JOIN requirement_completion rc ON rc.requirement_id = sr.id AND rc.application_id = $1
            WHERE sr.stage_id = $2
            ORDER BY sr.id
        `;
        
        const requirementsResult = await pool.query(requirementsQuery, [applicationId, application.current_stage_id]);
        application.current_stage_requirements = requirementsResult.rows;
    }
    
    return application;
};
