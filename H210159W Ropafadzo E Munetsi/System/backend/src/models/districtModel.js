import pool from '../config/db.js';

/**
 * Get all districts
 */
export const getAllDistrictsService = async () => {
    try {
        const result = await pool.query('SELECT * FROM districts ORDER BY name');
        return result.rows;
    } catch (error) {
        console.error('Error getting all districts:', error);
        throw new Error(`Failed to get districts: ${error.message}`);
    }
};

/**
 * Get a district by ID
 */
export const getDistrictByIdService = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM districts WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error getting district with ID ${id}:`, error);
        throw new Error(`Failed to get district: ${error.message}`);
    }
};

/**
 * Create a new district
 */
export const createDistrictService = async (name, description) => {
    try {
        const result = await pool.query(
            'INSERT INTO districts (name, description) VALUES ($1, $2) RETURNING *',
            [name, description]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating district:', error);
        throw new Error(`Failed to create district: ${error.message}`);
    }
};

/**
 * Update a district
 */
export const updateDistrictService = async (id, name, description) => {
    try {
        const result = await pool.query(
            'UPDATE districts SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
            [name, description, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error(`Error updating district with ID ${id}:`, error);
        throw new Error(`Failed to update district: ${error.message}`);
    }
};

/**
 * Delete a district
 */
export const deleteDistrictService = async (id) => {
    try {
        const result = await pool.query('DELETE FROM districts WHERE id = $1 RETURNING *', [id]);
        return result.rows[0];
    } catch (error) {
        console.error(`Error deleting district with ID ${id}:`, error);
        throw new Error(`Failed to delete district: ${error.message}`);
    }
};
