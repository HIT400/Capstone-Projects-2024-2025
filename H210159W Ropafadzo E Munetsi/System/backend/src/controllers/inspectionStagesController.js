import {
    getInspectionStagesByApplicationIdService,
    getUserApplicationsWithStagesService,
    updateInspectionStageService,
    createInspectionStageService
} from '../models/inspectionStagesModel.js';

// Standardized response function
const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

// Error response function
const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errors
  });
};

// Get all inspection stages for a specific application
export const getInspectionStagesByApplicationId = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Validate application ID
        if (!applicationId) {
            return errorResponse(res, 400, 'Application ID is required');
        }

        console.log(`API request received for inspection stages for application ${applicationId}`);

        // Get inspection stages
        const inspectionStages = await getInspectionStagesByApplicationIdService(applicationId);

        // Log the inspection stages data for debugging
        console.log(`Inspection stages for application ${applicationId}:`, JSON.stringify(inspectionStages, null, 2));

        // Check if inspector and payment data is present
        const hasInspectorData = inspectionStages.some(stage => stage.inspector);
        const hasInspectorIdData = inspectionStages.some(stage => stage.inspector_id);
        const hasPaymentData = inspectionStages.some(stage => stage.amount_paid);
        const hasReceiptData = inspectionStages.some(stage => stage.receipt_number);

        console.log(`Application ${applicationId} - Data check:
        - Has inspector names: ${hasInspectorData}
        - Has inspector IDs: ${hasInspectorIdData}
        - Has payment amounts: ${hasPaymentData}
        - Has receipt numbers: ${hasReceiptData}
        `);

        // Log each stage's inspector and payment data
        inspectionStages.forEach((stage, index) => {
            console.log(`Stage ${index + 1} (${stage.name}):
            - Inspector: ${stage.inspector || 'null'}
            - Inspector ID: ${stage.inspector_id || 'null'}
            - Amount paid: ${stage.amount_paid || 'null'}
            - Receipt number: ${stage.receipt_number || 'null'}
            `);
        });

        return successResponse(res, 200, 'Inspection stages retrieved successfully', inspectionStages);
    } catch (error) {
        console.error('Error getting inspection stages:', error);
        return errorResponse(res, 500, error.message);
    }
};

// Get all applications with their inspection stages for a specific user
export const getUserApplicationsWithStages = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user applications with stages
        const applications = await getUserApplicationsWithStagesService(userId);

        return successResponse(res, 200, 'User applications with stages retrieved successfully', applications);
    } catch (error) {
        console.error('Error getting user applications with stages:', error);
        return errorResponse(res, 500, error.message);
    }
};

// Update an inspection stage
export const updateInspectionStage = async (req, res) => {
    try {
        const { stageId } = req.params;
        const stageData = req.body;

        // Validate stage ID
        if (!stageId) {
            return errorResponse(res, 400, 'Stage ID is required');
        }

        // Validate required fields
        if (!stageData.status) {
            return errorResponse(res, 400, 'Status is required');
        }

        // Update inspection stage
        const updatedStage = await updateInspectionStageService(stageId, stageData);

        return successResponse(res, 200, 'Inspection stage updated successfully', updatedStage);
    } catch (error) {
        console.error('Error updating inspection stage:', error);
        return errorResponse(res, 500, error.message);
    }
};

// Create an inspection stage
export const createInspectionStage = async (req, res) => {
    try {
        const stageData = req.body;

        // Validate required fields
        if (!stageData.application_id || !stageData.name || !stageData.status) {
            return errorResponse(res, 400, 'Application ID, name, and status are required');
        }

        // Create inspection stage
        const newStage = await createInspectionStageService(stageData);

        return successResponse(res, 201, 'Inspection stage created successfully', newStage);
    } catch (error) {
        console.error('Error creating inspection stage:', error);
        return errorResponse(res, 500, error.message);
    }
};
