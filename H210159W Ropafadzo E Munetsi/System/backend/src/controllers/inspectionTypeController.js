import {
    getAllInspectionTypesService,
    getInspectionTypeByIdService,
    createInspectionTypeService,
    updateInspectionTypeService,
    deleteInspectionTypeService
} from '../models/inspectionTypeModel.js';

// Helper functions for responses
const successResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data
    });
};

const errorResponse = (res, statusCode, message) => {
    return res.status(statusCode).json({
        status: statusCode >= 500 ? 'error' : 'fail',
        message
    });
};

// Get all inspection types
export const getAllInspectionTypes = async (req, res) => {
    try {
        const types = await getAllInspectionTypesService();
        return successResponse(res, 200, 'Inspection types retrieved successfully', { types });
    } catch (error) {
        console.error('Error getting inspection types:', error);
        return errorResponse(res, 500, error.message);
    }
};

// Get inspection type by ID
export const getInspectionTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await getInspectionTypeByIdService(id);
        return successResponse(res, 200, 'Inspection type retrieved successfully', { type });
    } catch (error) {
        console.error('Error getting inspection type:', error);
        return errorResponse(res, error.message.includes('not found') ? 404 : 500, error.message);
    }
};

// Create a new inspection type
export const createInspectionType = async (req, res) => {
    try {
        const typeData = req.body;
        
        // Validate required fields
        if (!typeData.name) {
            return errorResponse(res, 400, 'Name is required');
        }
        
        const newType = await createInspectionTypeService(typeData);
        return successResponse(res, 201, 'Inspection type created successfully', { type: newType });
    } catch (error) {
        console.error('Error creating inspection type:', error);
        return errorResponse(res, error.message.includes('already exists') ? 409 : 500, error.message);
    }
};

// Update an inspection type
export const updateInspectionType = async (req, res) => {
    try {
        const { id } = req.params;
        const typeData = req.body;
        
        // Validate that there's something to update
        if (Object.keys(typeData).length === 0) {
            return errorResponse(res, 400, 'No fields to update');
        }
        
        const updatedType = await updateInspectionTypeService(id, typeData);
        return successResponse(res, 200, 'Inspection type updated successfully', { type: updatedType });
    } catch (error) {
        console.error('Error updating inspection type:', error);
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        } else if (error.message.includes('already exists')) {
            return errorResponse(res, 409, error.message);
        } else {
            return errorResponse(res, 500, error.message);
        }
    }
};

// Delete an inspection type
export const deleteInspectionType = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedType = await deleteInspectionTypeService(id);
        return successResponse(res, 200, 'Inspection type deleted successfully', { type: deletedType });
    } catch (error) {
        console.error('Error deleting inspection type:', error);
        if (error.message.includes('not found')) {
            return errorResponse(res, 404, error.message);
        } else if (error.message.includes('in use')) {
            return errorResponse(res, 409, error.message);
        } else {
            return errorResponse(res, 500, error.message);
        }
    }
};
