import {
  getAllSchedulesService,
  getSchedulesByApplicationService,
  getSchedulesByInspectorService,
  getScheduleByIdService,
  findAvailableInspectorService,
  createScheduleService,
  updateScheduleService,
  deleteScheduleService,
  getSchedulesByUserService,
  completeInspectionService
} from '../models/inspectionScheduleModel.js';
import { moveToNextStageService, getApplicationProgressService } from '../models/applicationStageModel.js';
import { updateFirstStageAfterSchedulingService } from '../models/inspectionStagesModel.js';

// Helper function for error responses
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message
  });
};

/**
 * Get all inspection schedules
 */
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await getAllSchedulesService();

    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/**
 * Get inspection schedules by application ID
 */
export const getSchedulesByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const schedules = await getSchedulesByApplicationService(applicationId);

    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/**
 * Get inspection schedules by inspector ID
 */
export const getSchedulesByInspector = async (req, res) => {
  try {
    const { inspectorId } = req.params;
    const schedules = await getSchedulesByInspectorService(inspectorId);

    res.status(200).json({
      status: 'success',
      results: schedules.length,
      data: schedules
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/**
 * Get inspection schedule by ID
 */
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await getScheduleByIdService(id);

    if (!schedule) {
      return errorResponse(res, 404, 'Inspection schedule not found');
    }

    res.status(200).json({
      status: 'success',
      data: schedule
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/**
 * Find available inspector for scheduling
 */
export const findAvailableInspector = async (req, res) => {
  try {
    const { scheduledDate, district, specialization, inspectionTypeId } = req.query;

    if (!scheduledDate) {
      return errorResponse(res, 400, 'Scheduled date is required');
    }

    const inspector = await findAvailableInspectorService(
      scheduledDate,
      district,
      specialization,
      inspectionTypeId ? parseInt(inspectionTypeId) : null
    );

    if (!inspector) {
      return errorResponse(res, 404, 'No available inspectors found for the specified criteria');
    }

    res.status(200).json({
      status: 'success',
      data: inspector
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/**
 * Create a new inspection schedule
 */
export const createSchedule = async (req, res) => {
  try {
    const {
      application_id,
      inspector_id,
      stage_id,
      scheduled_date,
      scheduled_time,
      status,
      notes
    } = req.body;

    // Basic validation
    if (!application_id || !inspector_id || !scheduled_date || !scheduled_time) {
      return errorResponse(res, 400, 'Application ID, inspector ID, scheduled date, and scheduled time are required');
    }

    // Get the user ID from the authenticated user
    const created_by = req.user?.id;

    // Log the user information for debugging
    console.log('User creating inspection schedule:', {
      userId: created_by,
      userRole: req.user?.role,
      applicationId: application_id,
      inspectorId: inspector_id,
      stageId: stage_id
    });

    // If user ID is not available, use a default value
    if (!created_by) {
      console.warn('No user ID available for created_by, using application_id as fallback');
    }

    // Check if this is a valid stage to schedule
    // First, get all stages for this application
    const { pool } = await import('../config/db.js');
    const client = await pool.connect();

    try {
      // Get all standard inspection stages
      const stagesQuery = `
        SELECT
          ist.id,
          ist.name,
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
          isc.stage_id,
          isc.status as schedule_status,
          ist.sequence_order
        FROM
          inspection_schedules isc
        JOIN
          inspection_stages ist ON isc.stage_id = ist.id
        WHERE
          isc.application_id = $1
        ORDER BY
          ist.sequence_order ASC
      `;
      const schedulesResult = await client.query(schedulesQuery, [application_id]);

      // Create a map of stage_id to status
      const stageStatusMap = {};
      schedulesResult.rows.forEach(schedule => {
        stageStatusMap[schedule.stage_id] = schedule.schedule_status;
      });

      // Find the requested stage
      const requestedStage = stagesResult.rows.find(stage => stage.id === parseInt(stage_id));

      if (!requestedStage) {
        return errorResponse(res, 400, 'Invalid stage ID');
      }

      // If this is the first stage, allow it
      if (requestedStage.sequence_order === 1) {
        console.log('First stage requested, allowing schedule');
      } else {
        // Check if the previous stage exists and is completed
        const previousStage = stagesResult.rows.find(stage =>
          stage.sequence_order === requestedStage.sequence_order - 1
        );

        if (previousStage) {
          const previousStageStatus = stageStatusMap[previousStage.id];

          // If the previous stage is not completed, return an error
          if (previousStageStatus !== 'completed') {
            return errorResponse(res, 400, `Previous stage "${previousStage.name}" must be completed before scheduling this stage`);
          }
        }
      }

      // All checks passed, create the schedule
      const scheduleData = {
        application_id,
        inspector_id,
        stage_id,
        scheduled_date,
        scheduled_time,
        status,
        notes
      };

      // Only add created_by if it exists
      if (created_by) {
        scheduleData.created_by = created_by;
      } else {
        console.log('No created_by value available, will use application_id as fallback');
      }

      const newSchedule = await createScheduleService(scheduleData);

      // Update the application stage to move to inspection stages
      try {
        // Get the current application progress to find the inspection scheduling stage
        const progress = await getApplicationProgressService(application_id);

        if (progress && progress.length > 0) {
          // Find the inspection scheduling stage
          const schedulingStage = progress.find(stage =>
            stage.stage_name.toLowerCase().includes('scheduling') ||
            stage.stage_name.toLowerCase().includes('schedule')
          );

          if (schedulingStage) {
            // Move to the next stage (inspection stages)
            await moveToNextStageService(
              application_id,
              created_by,
              `Inspection scheduled successfully. Schedule ID: ${newSchedule.id}`
            );

            console.log(`Successfully moved application ${application_id} to the next stage after scheduling inspection`);
          } else {
            console.log(`Could not find inspection scheduling stage for application ${application_id}`);
          }
        }
      } catch (stageError) {
        // Log the error but don't fail the request
        console.error('Error updating application stage after scheduling inspection:', stageError);
      }

      res.status(201).json({
        status: 'success',
        data: newSchedule
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating inspection schedule:', error);
    errorResponse(res, 400, error.message);
  }
};

/**
 * Update an inspection schedule
 */
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedSchedule = await updateScheduleService(id, updateData);

    if (!updatedSchedule) {
      return errorResponse(res, 404, 'Inspection schedule not found');
    }

    res.status(200).json({
      status: 'success',
      data: updatedSchedule
    });
  } catch (error) {
    errorResponse(res, 400, error.message);
  }
};

/**
 * Delete an inspection schedule
 */
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSchedule = await deleteScheduleService(id);

    if (!deletedSchedule) {
      return errorResponse(res, 404, 'Inspection schedule not found');
    }

    res.status(204).end();
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

/**
 * Get inspection schedules for all applications of the current user
 */
export const getSchedulesByUser = async (req, res) => {
  try {
    console.log('getSchedulesByUser called with user ID:', req.user?.id);

    if (!req.user || !req.user.id) {
      console.error('User ID is missing in request');
      return errorResponse(res, 401, 'User not authenticated');
    }

    const userId = req.user.id;
    console.log('Fetching schedules for user ID:', userId);

    try {
      const schedules = await getSchedulesByUserService(userId);
      console.log(`Retrieved ${schedules.length} schedules for user ${userId}`);

      if (schedules.length > 0) {
        console.log('Sample schedule data:', JSON.stringify(schedules[0], null, 2));
      }

      // Transform the data to include inspector details in a nested object
      // This makes it more consistent with other endpoints
      const transformedSchedules = schedules.map(schedule => {
        // Create a basic transformed object with the inspector details
        const transformed = {
          ...schedule,
          inspector: {
            id: schedule.inspector_id,
            name: schedule.inspector_name || 'Unknown',
            work_id: schedule.inspector_work_id,
            district: schedule.inspector_district,
            email: schedule.inspector_email,
            contact: schedule.inspector_contact
          }
        };

        // Only add inspection_stage if we have stage data
        // This prevents null/undefined errors in the frontend
        if (schedule.inspection_stage_id) {
          transformed.inspection_stage = {
            id: schedule.inspection_stage_id,
            name: schedule.inspection_stage_name,
            status: schedule.inspection_stage_status,
            date: schedule.inspection_stage_date
          };
        }

        return transformed;
      });

      console.log('Sending response with transformed schedules');
      res.status(200).json({
        status: 'success',
        results: transformedSchedules.length,
        data: transformedSchedules
      });
    } catch (serviceError) {
      console.error('Error in getSchedulesByUserService:', serviceError);
      console.error('Error stack:', serviceError.stack);
      return errorResponse(res, 500, `Database error: ${serviceError.message}`);
    }
  } catch (error) {
    console.error('Error in getSchedulesByUser controller:', error);
    console.error('Error stack:', error.stack);
    errorResponse(res, 500, error.message);
  }
};

/**
 * Complete an inspection (mark as completed by inspector)
 */
export const completeInspection = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    // Log the user role for debugging
    console.log(`User attempting to complete inspection: ID=${req.user.id}, Role=${req.user.role}`);

    // We'll skip the role check here since it's already handled by the middleware
    // This avoids potential double-checking issues
    const inspectorId = req.user.id;

    // Complete the inspection
    console.log(`Completing inspection ${id} by inspector ${inspectorId} with comments: ${comments}`);
    const completedInspection = await completeInspectionService(id, inspectorId, comments);

    return res.status(200).json({
      status: 'success',
      message: 'Inspection completed successfully',
      data: completedInspection
    });
  } catch (error) {
    console.error('Error completing inspection:', error);
    return errorResponse(res, 400, error.message);
  }
};
