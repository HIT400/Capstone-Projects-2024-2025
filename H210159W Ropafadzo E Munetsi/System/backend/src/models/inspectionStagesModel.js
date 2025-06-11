import pool from '../config/db.js';

// Get all inspection stages for a specific application
export const getInspectionStagesByApplicationIdService = async (applicationId) => {
    const client = await pool.connect();
    try {
        // Get application details
        const appQuery = `
            SELECT a.*, u.first_name || ' ' || u.last_name as owner_name
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.id = $1
        `;
        const appResult = await client.query(appQuery, [applicationId]);

        if (appResult.rows.length === 0) {
            throw new Error('Application not found');
        }

        const application = appResult.rows[0];

        // Get all standard inspection stages
        const stagesQuery = `
            SELECT
                ist.id,
                ist.name,
                ist.description,
                ist.sequence_order
            FROM
                inspection_stages ist
            ORDER BY
                ist.sequence_order ASC
        `;
        const stagesResult = await client.query(stagesQuery);

        // Get all schedules for this application
        const schedulesQuery = `
            SELECT
                isc.id,
                isc.application_id,
                isc.inspector_id,
                isc.stage_id,
                isc.scheduled_date,
                isc.scheduled_time,
                isc.status as schedule_status,
                isc.notes,
                isc.created_at,
                u.first_name || ' ' || u.last_name as inspector_name,
                i.work_id as inspector_work_id,
                i.assigned_district as inspector_district,
                i.inspection_type as inspector_specialization
            FROM
                inspection_schedules isc
            LEFT JOIN
                inspectors i ON isc.inspector_id = i.user_id
            LEFT JOIN
                users u ON i.user_id = u.id
            WHERE
                isc.application_id = $1
            ORDER BY
                isc.stage_id ASC, isc.scheduled_date DESC, isc.scheduled_time DESC
        `;
        const schedulesResult = await client.query(schedulesQuery, [applicationId]);

        // Get payment information for this application
        const paymentQuery = `
            SELECT
                json_build_object(
                    'id', p.id,
                    'amount', p.amount,
                    'payment_method', p.payment_method,
                    'reference_number', p.reference_number,
                    'payment_status', p.payment_status,
                    'payment_type', p.payment_type,
                    'created_at', p.created_at
                ) as payment_details
            FROM
                payments p
            WHERE
                p.application_id = $1
                AND p.payment_type = 'stage'
                AND p.payment_status = 'completed'
            ORDER BY
                p.created_at DESC
            LIMIT 1
        `;
        const paymentResult = await client.query(paymentQuery, [applicationId]);
        const paymentDetails = paymentResult.rows.length > 0 ? paymentResult.rows[0].payment_details : null;

        // Create a map of schedules by stage_id
        const schedulesByStage = {};
        schedulesResult.rows.forEach(schedule => {
            if (!schedulesByStage[schedule.stage_id]) {
                schedulesByStage[schedule.stage_id] = [];
            }
            schedulesByStage[schedule.stage_id].push(schedule);
        });

        // Format the stages data
        const stages = stagesResult.rows.map(stage => {
            // Get the latest schedule for this stage (if any)
            const stageSchedules = schedulesByStage[stage.id] || [];
            const latestSchedule = stageSchedules.length > 0 ? stageSchedules[0] : null;

            // Determine the stage status based on the schedule
            let stageStatus = 'pending';
            if (latestSchedule) {
                if (latestSchedule.schedule_status === 'completed') {
                    stageStatus = 'completed';
                } else if (latestSchedule.schedule_status === 'scheduled') {
                    stageStatus = 'scheduled';
                }
            }

            // Create inspector details if we have a schedule
            let inspectorDetails = null;
            if (latestSchedule && latestSchedule.inspector_id) {
                inspectorDetails = {
                    id: latestSchedule.inspector_id,
                    name: latestSchedule.inspector_name,
                    work_id: latestSchedule.inspector_work_id,
                    district: latestSchedule.inspector_district,
                    specialization: latestSchedule.inspector_specialization
                };
            }

            // Create schedule details object
            const scheduleDetails = latestSchedule ? {
                id: latestSchedule.id,
                scheduled_date: latestSchedule.scheduled_date,
                scheduled_time: latestSchedule.scheduled_time,
                status: latestSchedule.schedule_status,
                notes: latestSchedule.notes,
                created_at: latestSchedule.created_at,
                inspector_id: latestSchedule.inspector_id
            } : null;

            return {
                id: stage.id,
                name: stage.name,
                description: stage.description,
                status: stageStatus,
                date: latestSchedule ? latestSchedule.scheduled_date : null,
                inspector: latestSchedule ? latestSchedule.inspector_name : null,
                inspector_id: latestSchedule ? latestSchedule.inspector_id : null,
                inspector_details: inspectorDetails,
                stand_number: application.stand_number,
                owner: application.owner_name,
                amount_paid: paymentDetails ? paymentDetails.amount : null,
                receipt_number: paymentDetails ? paymentDetails.reference_number : null,
                location: null, // No longer stored in inspection_stages
                comments: null, // No longer stored in inspection_stages
                inspection_type_id: null, // No longer stored in inspection_stages
                inspection_type: null, // No longer stored in inspection_stages
                schedule: scheduleDetails,
                payment: paymentDetails,
                sequence_order: stage.sequence_order
            };
        });

        // Sort stages by sequence_order
        stages.sort((a, b) => a.sequence_order - b.sequence_order);

        return stages;
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to get inspection stages: ${error.message}`);
    } finally {
        client.release();
    }
};

// Get all applications with their inspection stages for a specific user
export const getUserApplicationsWithStagesService = async (userId) => {
    const client = await pool.connect();
    try {
        // Get all applications for this user
        const appsQuery = `
            SELECT a.*, u.first_name || ' ' || u.last_name as owner_name
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = $1
            ORDER BY a.created_at DESC
        `;
        const appsResult = await client.query(appsQuery, [userId]);

        if (appsResult.rows.length === 0) {
            return [];
        }

        // Get all standard inspection stages
        const stagesQuery = `
            SELECT id, name, sequence_order
            FROM inspection_stages
            ORDER BY sequence_order ASC
        `;
        const stagesResult = await client.query(stagesQuery);

        // Create a map of stage names by ID
        const stageNamesById = {};
        stagesResult.rows.forEach(stage => {
            stageNamesById[stage.id] = stage.name;
        });

        // Get all applications with their current stage
        const applications = await Promise.all(appsResult.rows.map(async (app) => {
            // Get the latest schedule for this application
            const scheduleQuery = `
                SELECT
                    isc.stage_id,
                    isc.status as schedule_status,
                    ist.name as stage_name,
                    ist.sequence_order
                FROM
                    inspection_schedules isc
                JOIN
                    inspection_stages ist ON isc.stage_id = ist.id
                WHERE
                    isc.application_id = $1
                ORDER BY
                    ist.sequence_order DESC, isc.scheduled_date DESC, isc.scheduled_time DESC
                LIMIT 1
            `;
            const scheduleResult = await client.query(scheduleQuery, [app.id]);

            let currentStage = 'Not started';

            if (scheduleResult.rows.length > 0) {
                const schedule = scheduleResult.rows[0];

                if (schedule.schedule_status === 'completed') {
                    // If the latest stage is completed, check if it's the last stage
                    if (schedule.sequence_order === stagesResult.rows.length) {
                        currentStage = 'All stages completed';
                    } else {
                        // Get the next stage
                        const nextStageId = stagesResult.rows.find(s => s.sequence_order === schedule.sequence_order + 1)?.id;
                        if (nextStageId && stageNamesById[nextStageId]) {
                            currentStage = `${stageNamesById[nextStageId]} (pending)`;
                        } else {
                            currentStage = `${schedule.stage_name} (${schedule.schedule_status})`;
                        }
                    }
                } else {
                    currentStage = `${schedule.stage_name} (${schedule.schedule_status})`;
                }
            } else {
                // No schedules yet, show the first stage as pending
                if (stagesResult.rows.length > 0) {
                    const firstStage = stagesResult.rows[0];
                    currentStage = `${firstStage.name} (pending)`;
                }
            }

            return {
                id: app.id,
                stand_number: app.stand_number,
                owner_name: app.owner_name,
                status: app.status,
                current_stage: currentStage
            };
        }));

        return applications;
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to get user applications with stages: ${error.message}`);
    } finally {
        client.release();
    }
};

// Update an inspection stage in the reference table
export const updateInspectionStageService = async (stageId, stageData) => {
    const client = await pool.connect();
    try {
        // Build the SET clause dynamically based on provided fields
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Add each field that is provided
        if (stageData.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(stageData.name);
        }

        if (stageData.description !== undefined) {
            fields.push(`description = $${paramIndex++}`);
            values.push(stageData.description);
        }

        if (stageData.sequence_order !== undefined) {
            fields.push(`sequence_order = $${paramIndex++}`);
            values.push(stageData.sequence_order);
        }

        // Add updated_at timestamp
        fields.push(`updated_at = NOW()`);

        // If no fields to update, return error
        if (fields.length === 0) {
            throw new Error('No fields to update');
        }

        // Build and execute the query
        const query = `
            UPDATE inspection_stages
            SET ${fields.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;
        values.push(stageId);

        const result = await client.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('Inspection stage not found');
        }

        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update inspection stage: ${error.message}`);
    } finally {
        client.release();
    }
};

// This function is no longer needed since we're using inspection_schedules directly
// It's kept here for backward compatibility but doesn't do anything
export const updateFirstStageAfterSchedulingService = async (applicationId, inspectorId, scheduledDate) => {
    console.log('updateFirstStageAfterSchedulingService is deprecated. Use createScheduleService instead.');
    return {
        id: 0,
        application_id: applicationId,
        inspector_id: inspectorId,
        date: scheduledDate,
        status: 'scheduled'
    };
};

// Update all inspection schedules with payment information after a consolidated payment
export const updateAllStagesWithPaymentInfoService = async (applicationId, amount, receiptNumber) => {
    const client = await pool.connect();
    try {
        console.log(`Updating all inspection schedules for application ${applicationId} with payment info: amount=${amount}, receipt=${receiptNumber}`);

        // Create a payment record
        const createPaymentQuery = `
            INSERT INTO payments (
                application_id,
                amount,
                payment_method,
                reference_number,
                payment_status,
                payment_type
            )
            VALUES ($1, $2, 'online', $3, 'completed', 'stage')
            RETURNING id
        `;

        const paymentResult = await client.query(createPaymentQuery, [applicationId, amount, receiptNumber]);
        const paymentId = paymentResult.rows[0].id;

        console.log(`Created payment record with ID ${paymentId}`);

        // No need to update inspection stages anymore since they're now a reference table
        // Instead, we'll return the payment record

        return [{
            id: paymentId,
            application_id: applicationId,
            amount: amount,
            reference_number: receiptNumber,
            payment_status: 'completed',
            payment_type: 'stage'
        }];
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update inspection schedules with payment information: ${error.message}`);
    } finally {
        client.release();
    }
};

// Create a new inspection stage (for reference table only)
export const createInspectionStageService = async (stageData) => {
    const client = await pool.connect();
    try {
        // Required fields
        const fields = ['name', 'sequence_order'];
        const placeholders = ['$1', '$2'];
        const values = [
            stageData.name,
            stageData.sequence_order
        ];

        let paramIndex = 3;

        // Add optional fields if provided
        if (stageData.description !== undefined) {
            fields.push('description');
            placeholders.push(`$${paramIndex++}`);
            values.push(stageData.description);
        }

        // Build and execute the query
        const query = `
            INSERT INTO inspection_stages (${fields.join(', ')})
            VALUES (${placeholders.join(', ')})
            RETURNING *
        `;

        const result = await client.query(query, values);

        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to create inspection stage: ${error.message}`);
    } finally {
        client.release();
    }
};


