import {
    getAllStagesService,
    getStageByIdService,
    getStageRequirementsService,
    getApplicationProgressService,
    getCurrentStageService,
    getRequirementCompletionService,
    checkStageCompletionService,
    updateRequirementStatusService,
    moveToNextStageService,
    getUserApplicationsWithStagesService,
    getApplicationDetailsService
} from "../models/applicationStageModel.js";

// Standardized response function
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

// Get all application stages
export const getAllStages = async (req, res, next) => {
    try {
        const stages = await getAllStagesService();
        handleResponse(res, 200, "Application stages fetched successfully", stages);
    } catch (err) {
        next(err);
    }
};

// Get a specific stage by ID
export const getStageById = async (req, res, next) => {
    try {
        const stage = await getStageByIdService(req.params.id);
        if (!stage) return handleResponse(res, 404, "Stage not found");
        handleResponse(res, 200, "Stage fetched successfully", stage);
    } catch (err) {
        next(err);
    }
};

// Get stage requirements
export const getStageRequirements = async (req, res, next) => {
    try {
        const requirements = await getStageRequirementsService(req.params.stageId);
        handleResponse(res, 200, "Stage requirements fetched successfully", requirements);
    } catch (err) {
        next(err);
    }
};

// Get application progress for a specific application
export const getApplicationProgress = async (req, res, next) => {
    try {
        const progress = await getApplicationProgressService(req.params.applicationId);
        handleResponse(res, 200, "Application progress fetched successfully", progress);
    } catch (err) {
        next(err);
    }
};

// Get current stage for an application
export const getCurrentStage = async (req, res, next) => {
    try {
        const stage = await getCurrentStageService(req.params.applicationId);
        if (!stage) return handleResponse(res, 404, "Current stage not found");
        handleResponse(res, 200, "Current stage fetched successfully", stage);
    } catch (err) {
        next(err);
    }
};

// Get requirement completion status for an application
export const getRequirementCompletion = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { stageId } = req.query;
        
        const requirements = await getRequirementCompletionService(
            applicationId,
            stageId ? parseInt(stageId) : null
        );
        
        handleResponse(res, 200, "Requirement completion status fetched successfully", requirements);
    } catch (err) {
        next(err);
    }
};

// Check if all requirements for a stage are completed
export const checkStageCompletion = async (req, res, next) => {
    try {
        const { applicationId, stageId } = req.params;
        
        const completionStatus = await checkStageCompletionService(applicationId, stageId);
        
        handleResponse(res, 200, "Stage completion status checked successfully", completionStatus);
    } catch (err) {
        next(err);
    }
};

// Update requirement completion status
export const updateRequirementStatus = async (req, res, next) => {
    try {
        const { applicationId, requirementId } = req.params;
        const { status, notes, referenceId } = req.body;
        
        // Validate status
        if (!['pending', 'completed', 'rejected'].includes(status)) {
            return handleResponse(res, 400, "Invalid status. Must be 'pending', 'completed', or 'rejected'");
        }
        
        const verifiedBy = req.user?.id; // Get the current user ID if available
        
        const updatedRequirement = await updateRequirementStatusService(
            applicationId,
            requirementId,
            status,
            notes,
            referenceId,
            verifiedBy
        );
        
        handleResponse(res, 200, "Requirement status updated successfully", updatedRequirement);
    } catch (err) {
        next(err);
    }
};

// Move an application to the next stage (admin function)
export const moveToNextStage = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { notes } = req.body;
        
        const completedBy = req.user?.id; // Get the current user ID if available
        
        const result = await moveToNextStageService(applicationId, completedBy, notes);
        
        if (result.completed) {
            handleResponse(res, 200, "Application completed successfully", result);
        } else {
            handleResponse(res, 200, "Application moved to next stage successfully", result);
        }
    } catch (err) {
        next(err);
    }
};

// Get applications by user ID with stage information
export const getUserApplicationsWithStages = async (req, res, next) => {
    try {
        const userId = req.params.userId || req.user?.id; // Use provided userId or current user
        
        if (!userId) {
            return handleResponse(res, 400, "User ID is required");
        }
        
        const applications = await getUserApplicationsWithStagesService(userId);
        
        handleResponse(res, 200, "User applications fetched successfully", applications);
    } catch (err) {
        next(err);
    }
};

// Get application details with stage information
export const getApplicationDetails = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        
        const application = await getApplicationDetailsService(applicationId);
        
        if (!application) {
            return handleResponse(res, 404, "Application not found");
        }
        
        handleResponse(res, 200, "Application details fetched successfully", application);
    } catch (err) {
        next(err);
    }
};
