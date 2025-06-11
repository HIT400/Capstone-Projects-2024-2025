import pool from "../config/db.js";

export const getAllApplicationsService = async () => {
    const result = await pool.query("SELECT * FROM applications");
    return result.rows;
};
export const getApplicationByIdService = async (id) => {
    const result = await pool.query("SELECT * FROM applications where id = $1", [id]);
    return result.rows[0]
};

export const createApplicationService = async (
    user_id,
    stand_number,
    postal_address,
    district,
    construction_type,
    project_description,
    start_date,
    completion_date,
    architect,
    owner_name,
    email,
    contact_number,
    status = 'pending'
) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert the application
        const applicationQuery = `
            INSERT INTO applications (
                user_id, status, stand_number, postal_address, district, construction_type,
                project_description, start_date, completion_date,
                architect, owner_name, email, contact_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *;
        `;

        const applicationValues = [
            user_id,
            status,
            stand_number,
            postal_address,
            district,
            construction_type,
            project_description,
            start_date,
            completion_date,
            architect,
            owner_name,
            email,
            contact_number
        ];

        const applicationResult = await client.query(applicationQuery, applicationValues);
        const newApplication = applicationResult.rows[0];

        // 2. If status is 'submitted', initialize the first stage
        if (status === 'submitted') {
            // Get the first stage (Application Submission)
            const stageQuery = `
                SELECT id FROM application_stages
                WHERE order_number = 1
                LIMIT 1;
            `;

            const stageResult = await client.query(stageQuery);
            if (stageResult.rows.length > 0) {
                const stageId = stageResult.rows[0].id;

                // Update application with current stage
                await client.query(
                    `UPDATE applications SET current_stage_id = $1 WHERE id = $2`,
                    [stageId, newApplication.id]
                );

                // Create application progress entry for first stage
                await client.query(
                    `INSERT INTO application_progress
                     (application_id, stage_id, status)
                     VALUES ($1, $2, 'in_progress')`,
                    [newApplication.id, stageId]
                );

                // Initialize requirement completion records
                const requirementsQuery = `
                    SELECT id FROM stage_requirements
                    WHERE stage_id = $1;
                `;

                const requirementsResult = await client.query(requirementsQuery, [stageId]);
                for (const req of requirementsResult.rows) {
                    await client.query(
                        `INSERT INTO requirement_completion
                         (application_id, requirement_id, status)
                         VALUES ($1, $2, 'pending')`,
                        [newApplication.id, req.id]
                    );
                }

                // Update the application object with current stage
                newApplication.current_stage_id = stageId;
            }
        }

        await client.query('COMMIT');
        return newApplication;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }

};
// export const updateApplicationService = async (id, standNumber, postalAddress, estimatedCost, constructionType, projectDescription, startDate, completionDate, buildingContractor, architect, ownerName, email, contact, purposeOfBuilding) => {
//     const result = await pool.query("UPDATE applications SET name=$1, eamil=$2 WHERE id=$3 RETURNING *",
//         [firstName, lastName, email, telNumber, address, id]
//     );
//     return result.rows[0]
// };
export const deleteApplicationService = async (id) => {
    const result = await pool.query("DELETE FROM applications WHERE id = $1 RETURNING*",
        [id]
    );
    return result.rows[0]
};

/**
 * Update the status of an application
 * @param {number} id - Application ID
 * @param {string} status - New status value
 * @returns {Object} - Updated application
 */
export const updateApplicationStatusService = async (id, status) => {
    const result = await pool.query(
        "UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [status, id]
    );
    return result.rows[0];
};