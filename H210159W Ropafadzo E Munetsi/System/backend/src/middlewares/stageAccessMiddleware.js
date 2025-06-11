import { getCurrentStageService, getApplicationDetailsService } from "../models/applicationStageModel.js";
import { getApplicationByIdService } from "../models/applicationModel.js";

/**
 * Middleware to check if a user can access a specific application stage
 * This ensures users can't skip stages or access stages they haven't reached yet
 */
const stageAccessMiddleware = {
    // Check if user can access a specific application
    checkApplicationAccess: async (req, res, next) => {
        try {
            const { applicationId } = req.params;
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            
            // Get the application
            const application = await getApplicationByIdService(applicationId);
            
            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            // Check if the user owns the application or is an admin/inspector
            if (application.user_id !== userId && !['admin', 'inspector', 'superadmin'].includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this application'
                });
            }
            
            // Add the application to the request object for later use
            req.application = application;
            next();
        } catch (error) {
            console.error('Application access check error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while checking application access'
            });
        }
    },
    
    // Check if user can access a specific stage
    checkStageAccess: async (req, res, next) => {
        try {
            const { applicationId, stageId } = req.params;
            const userId = req.user?.id;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            
            // Skip stage access check for admins and inspectors
            if (['admin', 'inspector', 'superadmin'].includes(req.user.role)) {
                return next();
            }
            
            // Get the application details with stages
            const applicationDetails = await getApplicationDetailsService(applicationId);
            
            if (!applicationDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }
            
            // Check if the user owns the application
            if (applicationDetails.user_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this application'
                });
            }
            
            // Get the requested stage's order number
            const requestedStage = applicationDetails.stages.find(stage => stage.id === parseInt(stageId));
            
            if (!requestedStage) {
                return res.status(404).json({
                    success: false,
                    message: 'Stage not found'
                });
            }
            
            // Get the current stage's order number
            const currentStageOrderNumber = applicationDetails.current_stage_order || 0;
            
            // Check if the requested stage is accessible (current or completed)
            if (requestedStage.order_number > currentStageOrderNumber) {
                return res.status(403).json({
                    success: false,
                    message: 'You cannot access this stage yet. Please complete the current stage first.'
                });
            }
            
            next();
        } catch (error) {
            console.error('Stage access check error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while checking stage access'
            });
        }
    },
    
    // Check if all requirements for the current stage are completed before proceeding
    checkStageCompletion: async (req, res, next) => {
        try {
            const { applicationId } = req.params;
            
            // Skip completion check for admins and inspectors
            if (['admin', 'inspector', 'superadmin'].includes(req.user.role)) {
                return next();
            }
            
            // Get the current stage
            const currentStage = await getCurrentStageService(applicationId);
            
            if (!currentStage) {
                return res.status(404).json({
                    success: false,
                    message: 'Current stage not found'
                });
            }
            
            // Check if the current stage is completed
            if (currentStage.progress_status !== 'completed') {
                return res.status(403).json({
                    success: false,
                    message: 'You must complete the current stage before proceeding'
                });
            }
            
            next();
        } catch (error) {
            console.error('Stage completion check error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while checking stage completion'
            });
        }
    }
};

export default stageAccessMiddleware;
