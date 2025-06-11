import pool from "../config/db.js";

/**
 * Get all inspection schedules
 */
export const getAllSchedulesService = async () => {
  try {
    // Note: 'is' is a reserved keyword in SQL, so we need to use double quotes
    const query = `
      SELECT
        "inspection_schedules".*,
        a.stand_number,
        a.status as application_status,
        CONCAT(u_inspector.first_name, ' ', u_inspector.last_name) as inspector_name,
        CONCAT(u_applicant.first_name, ' ', u_applicant.last_name) as applicant_name,
        u_applicant.email as applicant_email,
        u_applicant.contact_number as applicant_contact,
        (
          SELECT name
          FROM inspection_stages
          WHERE application_id = "inspection_schedules".application_id
          ORDER BY id ASC
          LIMIT 1
        ) as stage_name
      FROM
        inspection_schedules "inspection_schedules"
      JOIN
        applications a ON "inspection_schedules".application_id = a.id
      JOIN
        inspectors i ON "inspection_schedules".inspector_id = i.user_id
      JOIN
        users u_inspector ON i.user_id = u_inspector.id
      JOIN
        users u_applicant ON a.user_id = u_applicant.id
      ORDER BY
        "inspection_schedules".scheduled_date DESC, "inspection_schedules".scheduled_time DESC
    `;

    console.log('Executing getAllSchedulesService query');
    const result = await pool.query(query);
    console.log(`Query returned ${result.rows.length} inspection schedules`);

    return result.rows;
  } catch (error) {
    console.error('Error in getAllSchedulesService:', error);
    throw new Error(`Failed to get inspection schedules: ${error.message}`);
  }
};

/**
 * Get inspection schedules by application ID
 */
export const getSchedulesByApplicationService = async (applicationId) => {
  try {
    // Validate applicationId to ensure it's a valid number
    const appId = parseInt(applicationId);
    if (isNaN(appId)) {
      throw new Error('Invalid application ID');
    }

    const query = `
      SELECT
        "inspection_schedules".*,
        CONCAT("users"."first_name", ' ', "users"."last_name") as inspector_name,
        "inspectors"."inspection_type"
      FROM
        "inspection_schedules"
      JOIN
        "inspectors" ON "inspection_schedules"."inspector_id" = "inspectors"."user_id"
      JOIN
        "users" ON "inspectors"."user_id" = "users"."id"
      WHERE
        "inspection_schedules"."application_id" = $1
      ORDER BY
        "inspection_schedules"."scheduled_date" DESC, "inspection_schedules"."scheduled_time" DESC
    `;

    const result = await pool.query(query, [appId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Failed to get inspection schedules for application: ${error.message}`);
  }
};

/**
 * Get inspection schedules by inspector ID
 */
export const getSchedulesByInspectorService = async (inspectorId) => {
  try {
    // Note: 'is' is a reserved keyword in SQL, so we need to use double quotes
    const query = `
      SELECT
        "inspection_schedules".*,
        a.stand_number,
        a.status as application_status,
        CONCAT(u.first_name, ' ', u.last_name) as applicant_name,
        u.email as applicant_email,
        u.contact_number as applicant_contact,
        ist.name as stage_name,
        ist.description as stage_description,
        ist.sequence_order as stage_sequence
      FROM
        inspection_schedules "inspection_schedules"
      JOIN
        applications a ON "inspection_schedules".application_id = a.id
      JOIN
        users u ON a.user_id = u.id
      JOIN
        inspection_stages ist ON "inspection_schedules".stage_id = ist.id
      WHERE
        "inspection_schedules".inspector_id = $1
      ORDER BY
        "inspection_schedules".scheduled_date DESC, "inspection_schedules".scheduled_time DESC
    `;

    console.log(`Executing getSchedulesByInspectorService query for inspector ID: ${inspectorId}`);
    const result = await pool.query(query, [inspectorId]);
    console.log(`Query returned ${result.rows.length} inspection schedules for inspector ${inspectorId}`);

    return result.rows;
  } catch (error) {
    console.error(`Error in getSchedulesByInspectorService for inspector ${inspectorId}:`, error);
    throw new Error(`Failed to get inspection schedules for inspector: ${error.message}`);
  }
};

/**
 * Get inspection schedule by ID
 */
export const getScheduleByIdService = async (id) => {
  try {
    // Note: 'is' is a reserved keyword in SQL, so we need to use double quotes
    const query = `
      SELECT
        "inspection_schedules".*,
        a.stand_number,
        a.status as application_status,
        CONCAT(u_inspector.first_name, ' ', u_inspector.last_name) as inspector_name,
        i.inspection_type,
        CONCAT(u_applicant.first_name, ' ', u_applicant.last_name) as applicant_name,
        u_applicant.email as applicant_email,
        u_applicant.contact_number as applicant_contact
      FROM
        inspection_schedules "inspection_schedules"
      JOIN
        applications a ON "inspection_schedules".application_id = a.id
      JOIN
        inspectors i ON "inspection_schedules".inspector_id = i.user_id
      JOIN
        users u_inspector ON i.user_id = u_inspector.id
      JOIN
        users u_applicant ON a.user_id = u_applicant.id
      WHERE
        "inspection_schedules".id = $1
    `;

    console.log(`Executing getScheduleByIdService query for schedule ID: ${id}`);
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      console.log(`No inspection schedule found with ID: ${id}`);
      return null;
    }

    console.log(`Found inspection schedule with ID: ${id}`);
    return result.rows[0];
  } catch (error) {
    console.error(`Error in getScheduleByIdService for schedule ${id}:`, error);
    throw new Error(`Failed to get inspection schedule: ${error.message}`);
  }
};

/**
 * Find the most available inspector for scheduling
 * This function finds the inspector with the fewest scheduled inspections
 * on the requested date, considering their inspection type and district
 */
export const findAvailableInspectorService = async (scheduledDate, district = null, inspectionTypeId = null) => {
  try {
    console.log('findAvailableInspectorService called with params:', { scheduledDate, district, inspectionTypeId });

    // Validate scheduledDate
    if (!scheduledDate) {
      throw new Error('Scheduled date is required');
    }

    // Base query to count scheduled inspections for each inspector on the given date
    let query = `
      WITH inspector_counts AS (
        SELECT
          i.user_id as inspector_id,
          CONCAT(u.first_name, ' ', u.last_name) as inspector_name,
          i.inspection_type,
          i.assigned_district,
          COUNT(s.id) as scheduled_count
        FROM
          inspectors i
        LEFT JOIN
          inspection_schedules s ON i.user_id = s.inspector_id
          AND s.scheduled_date = $1
          AND s.status != 'cancelled'
        JOIN
          users u ON i.user_id = u.id
        WHERE
          i.available = true
    `;

    // Add filters for district, specialization, and inspection type if provided
    const queryParams = [scheduledDate];

    // Filter by district if provided
    if (district) {
      query += ` AND i.assigned_district = $${queryParams.length + 1}`;
      queryParams.push(district);
      console.log(`Filtering inspectors by district: ${district}`);
    } else {
      // If no district is provided, we'll find any available inspector
      console.log('No district provided, finding any available inspector');
    }

    // Specialization filter removed as the column no longer exists
    // We'll use inspection_type instead

    // If inspection type ID is provided, match inspectors with that inspection type
    if (inspectionTypeId) {
      try {
        // Get the inspection type name
        const typeQuery = `
          SELECT name FROM inspection_types WHERE id = $1
        `;
        console.log('Executing inspection type query with ID:', inspectionTypeId);
        const typeResult = await pool.query(typeQuery, [inspectionTypeId]);
        console.log('Inspection type query result:', typeResult.rows);

        if (typeResult.rows.length > 0) {
          const typeName = typeResult.rows[0].name;
          // Only match inspectors with the exact inspection type - no more fallback to 'General'
          query += ` AND i.inspection_type = $${queryParams.length + 1}`;
          queryParams.push(typeName);
        } else {
          console.log(`No inspection type found with ID ${inspectionTypeId}`);
          // Continue without filtering by inspection type
          console.log('Continuing without inspection type filter');
        }
      } catch (typeError) {
        console.error('Error getting inspection type:', typeError);
        // Continue without filtering by inspection type
        console.log('Continuing without inspection type filter due to error');
      }
    } else {
      // If no inspection type is provided, we'll find any available inspector
      console.log('No inspection type provided, finding any available inspector');
    }

    // Group by inspector and order by scheduled count
    query += `
        GROUP BY
          i.user_id, u.first_name, u.last_name, i.inspection_type, i.assigned_district
      )
      SELECT
        inspector_id,
        inspector_name,
        inspection_type,
        assigned_district,
        scheduled_count
      FROM inspector_counts
      ORDER BY scheduled_count ASC, inspector_name ASC
      LIMIT 1
    `;

    console.log('Executing query:', query);
    console.log('With parameters:', queryParams);

    const result = await pool.query(query, queryParams);
    console.log('Query result:', result.rows);

    return result.rows[0];
  } catch (error) {
    console.error('Error in findAvailableInspectorService:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to find available inspector: ${error.message}`);
  }
};

/**
 * Create a new inspection schedule
 */
export const createScheduleService = async (scheduleData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate that stage_id is provided
    if (!scheduleData.stage_id) {
      // If not provided, try to determine the next stage for this application
      const stageQuery = `
        SELECT MIN(id) as next_stage_id
        FROM inspection_stages
        WHERE id NOT IN (
          SELECT stage_id
          FROM inspection_schedules
          WHERE application_id = $1 AND status IN ('scheduled', 'completed')
        )
      `;

      const stageResult = await client.query(stageQuery, [scheduleData.application_id]);

      if (stageResult.rows.length > 0 && stageResult.rows[0].next_stage_id) {
        scheduleData.stage_id = stageResult.rows[0].next_stage_id;
      } else {
        // Default to the first stage if we can't determine
        scheduleData.stage_id = 1;
      }

      console.log(`Automatically determined stage_id: ${scheduleData.stage_id} for application ${scheduleData.application_id}`);
    }

    const query = `
      INSERT INTO inspection_schedules (
        application_id,
        inspector_id,
        stage_id,
        scheduled_date,
        scheduled_time,
        status,
        notes,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    // Log the schedule data for debugging
    console.log('Creating inspection schedule with data:', {
      applicationId: scheduleData.application_id,
      inspectorId: scheduleData.inspector_id,
      stageId: scheduleData.stage_id,
      scheduledDate: scheduleData.scheduled_date,
      scheduledTime: scheduleData.scheduled_time,
      status: scheduleData.status || 'scheduled',
      createdBy: scheduleData.created_by || 'Not provided'
    });

    // Use the application_id as created_by if not provided
    const created_by = scheduleData.created_by || scheduleData.application_id;

    const values = [
      scheduleData.application_id,
      scheduleData.inspector_id,
      scheduleData.stage_id,
      scheduleData.scheduled_date,
      scheduleData.scheduled_time,
      scheduleData.status || 'scheduled',
      scheduleData.notes,
      created_by
    ];

    const result = await client.query(query, values);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to create inspection schedule: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Update an inspection schedule
 */
export const updateScheduleService = async (id, updateData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const query = `
      UPDATE inspection_schedules
      SET
        inspector_id = COALESCE($2, inspector_id),
        scheduled_date = COALESCE($3, scheduled_date),
        scheduled_time = COALESCE($4, scheduled_time),
        status = COALESCE($5, status),
        notes = COALESCE($6, notes),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      updateData.inspector_id,
      updateData.scheduled_date,
      updateData.scheduled_time,
      updateData.status,
      updateData.notes
    ];

    const result = await client.query(query, values);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Failed to update inspection schedule: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Complete an inspection schedule
 * This marks the inspection as completed and allows the applicant to schedule the next stage
 */
export const completeInspectionService = async (scheduleId, inspectorId, comments) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // First, get the schedule to verify it exists and get the application_id and stage_id
    const getScheduleQuery = `
      SELECT
        id,
        application_id,
        stage_id,
        status
      FROM
        inspection_schedules
      WHERE
        id = $1
    `;

    const scheduleResult = await client.query(getScheduleQuery, [scheduleId]);

    if (scheduleResult.rows.length === 0) {
      // If we can't find the schedule by ID, it might be a stage ID from the old system
      // Try to find a schedule with this stage_id
      console.log(`Schedule with ID ${scheduleId} not found, checking if it's a stage ID...`);

      const findByStageQuery = `
        SELECT
          id,
          application_id,
          stage_id,
          status
        FROM
          inspection_schedules
        WHERE
          stage_id = $1
        ORDER BY
          created_at DESC
        LIMIT 1
      `;

      const stageResult = await client.query(findByStageQuery, [scheduleId]);

      if (stageResult.rows.length === 0) {
        throw new Error('Inspection schedule not found');
      }

      // Use the found schedule
      scheduleId = stageResult.rows[0].id;
      console.log(`Found schedule with ID ${scheduleId} for stage ID ${stageResult.rows[0].stage_id}`);
    }

    // Get the schedule again with the possibly updated scheduleId
    const finalScheduleResult = await client.query(getScheduleQuery, [scheduleId]);
    const schedule = finalScheduleResult.rows[0];

    // Check if the schedule is already completed
    if (schedule.status === 'completed') {
      throw new Error('Inspection is already marked as completed');
    }

    // Update the schedule status to completed
    const updateQuery = `
      UPDATE
        inspection_schedules
      SET
        status = 'completed',
        notes = COALESCE($1, notes),
        updated_at = NOW()
      WHERE
        id = $2
      RETURNING *
    `;

    const updateResult = await client.query(updateQuery, [comments, scheduleId]);

    if (updateResult.rows.length === 0) {
      throw new Error('Failed to update inspection schedule');
    }

    const updatedSchedule = updateResult.rows[0];

    // Log the completion
    console.log(`Inspection schedule ${scheduleId} marked as completed by inspector ${inspectorId}`);
    console.log(`Application ID: ${schedule.application_id}, Stage ID: ${schedule.stage_id}`);

    await client.query('COMMIT');
    return updatedSchedule;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error completing inspection:', error);
    throw new Error(`Failed to complete inspection: ${error.message}`);
  } finally {
    client.release();
  }
};

/**
 * Delete an inspection schedule
 */
export const deleteScheduleService = async (id) => {
  try {
    const query = `
      DELETE FROM inspection_schedules
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to delete inspection schedule: ${error.message}`);
  }
};

/**
 * Get inspection schedules for all applications of a user
 */
export const getSchedulesByUserService = async (userId) => {
  try {
    console.log('getSchedulesByUserService called with userId:', userId);

    // Validate userId
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Use a simpler query first to ensure we're getting basic data
    // Note: 'is' is a reserved keyword in SQL, so we need to use double quotes
    const query = `
      SELECT
        "inspection_schedules".*,
        a.stand_number,
        a.owner_name,
        CONCAT(u.first_name, ' ', u.last_name) as inspector_name,
        i.inspection_type,
        i.work_id as inspector_work_id,
        i.assigned_district as inspector_district,
        u.email as inspector_email,
        u.contact_number as inspector_contact,
        ist.name as stage_name,
        ist.description as stage_description,
        ist.sequence_order as stage_sequence
      FROM
        inspection_schedules "inspection_schedules"
      JOIN
        applications a ON "inspection_schedules".application_id = a.id
      JOIN
        inspectors i ON "inspection_schedules".inspector_id = i.user_id
      JOIN
        users u ON i.user_id = u.id
      JOIN
        inspection_stages ist ON "inspection_schedules".stage_id = ist.id
      WHERE
        a.user_id = $1
      ORDER BY
        "inspection_schedules".scheduled_date DESC, "inspection_schedules".scheduled_time DESC
    `;

    console.log('Executing query with userId:', userId);

    try {
      const result = await pool.query(query, [userId]);
      console.log(`Query returned ${result.rows.length} rows`);

      if (result.rows.length > 0) {
        console.log('First row sample:', JSON.stringify(result.rows[0], null, 2));
      } else {
        console.log('No inspection schedules found for this user');
      }

      return result.rows;
    } catch (dbError) {
      console.error('Database error in getSchedulesByUserService:', dbError);
      console.error('Error stack:', dbError.stack);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (error) {
    console.error('Error in getSchedulesByUserService:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to get inspection schedules for user: ${error.message}`);
  }
};

