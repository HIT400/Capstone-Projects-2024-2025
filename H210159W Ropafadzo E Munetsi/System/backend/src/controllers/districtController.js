import {
    getAllDistrictsService,
    getDistrictByIdService,
    createDistrictService,
    updateDistrictService,
    deleteDistrictService
} from '../models/districtModel.js';

// Standardized response function
const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

/**
 * Get all districts
 */
export const getAllDistricts = async (req, res, next) => {
    try {
        const districts = await getAllDistrictsService();
        handleResponse(res, 200, "Districts fetched successfully", districts);
    } catch (err) {
        next(err);
    }
};

/**
 * Get a district by ID
 */
export const getDistrictById = async (req, res, next) => {
    try {
        const district = await getDistrictByIdService(req.params.id);
        if (!district) return handleResponse(res, 404, "District not found");
        handleResponse(res, 200, "District fetched successfully", district);
    } catch (err) {
        next(err);
    }
};

/**
 * Create a new district
 */
export const createDistrict = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        
        // Validate required fields
        if (!name) {
            return handleResponse(res, 400, "District name is required");
        }
        
        const newDistrict = await createDistrictService(name, description || '');
        handleResponse(res, 201, "District created successfully", newDistrict);
    } catch (err) {
        next(err);
    }
};

/**
 * Update a district
 */
export const updateDistrict = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        
        // Validate required fields
        if (!name) {
            return handleResponse(res, 400, "District name is required");
        }
        
        const updatedDistrict = await updateDistrictService(req.params.id, name, description || '');
        if (!updatedDistrict) return handleResponse(res, 404, "District not found");
        handleResponse(res, 200, "District updated successfully", updatedDistrict);
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a district
 */
export const deleteDistrict = async (req, res, next) => {
    try {
        const deletedDistrict = await deleteDistrictService(req.params.id);
        if (!deletedDistrict) return handleResponse(res, 404, "District not found");
        handleResponse(res, 200, "District deleted successfully", deletedDistrict);
    } catch (err) {
        next(err);
    }
};
