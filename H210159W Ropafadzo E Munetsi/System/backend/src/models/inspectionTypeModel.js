import pool from '../config/db.js';

// Get all inspection types
export const getAllInspectionTypesService = async () => {
    try {
        const query = `
            SELECT * FROM inspection_types
            ORDER BY name ASC
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to get inspection types: ${error.message}`);
    }
};

// Get inspection type by ID
export const getInspectionTypeByIdService = async (id) => {
    try {
        const query = `
            SELECT * FROM inspection_types
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            throw new Error('Inspection type not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to get inspection type: ${error.message}`);
    }
};

// Create a new inspection type
export const createInspectionTypeService = async (typeData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Check if type with same name already exists
        const checkQuery = `
            SELECT * FROM inspection_types
            WHERE name = $1
        `;
        const checkResult = await client.query(checkQuery, [typeData.name]);
        
        if (checkResult.rows.length > 0) {
            throw new Error('Inspection type with this name already exists');
        }
        
        // Insert new type
        const insertQuery = `
            INSERT INTO inspection_types (name, description)
            VALUES ($1, $2)
            RETURNING *
        `;
        const insertResult = await client.query(insertQuery, [
            typeData.name,
            typeData.description || null
        ]);
        
        await client.query('COMMIT');
        return insertResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        throw new Error(`Failed to create inspection type: ${error.message}`);
    } finally {
        client.release();
    }
};

// Update an inspection type
export const updateInspectionTypeService = async (id, typeData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Check if type exists
        const checkQuery = `
            SELECT * FROM inspection_types
            WHERE id = $1
        `;
        const checkResult = await client.query(checkQuery, [id]);
        
        if (checkResult.rows.length === 0) {
            throw new Error('Inspection type not found');
        }
        
        // Check if name is being changed and if it conflicts
        if (typeData.name) {
            const nameCheckQuery = `
                SELECT * FROM inspection_types
                WHERE name = $1 AND id != $2
            `;
            const nameCheckResult = await client.query(nameCheckQuery, [typeData.name, id]);
            
            if (nameCheckResult.rows.length > 0) {
                throw new Error('Another inspection type with this name already exists');
            }
        }
        
        // Update type
        const updateQuery = `
            UPDATE inspection_types
            SET 
                name = COALESCE($2, name),
                description = COALESCE($3, description),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        `;
        const updateResult = await client.query(updateQuery, [
            id,
            typeData.name,
            typeData.description
        ]);
        
        await client.query('COMMIT');
        return updateResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        throw new Error(`Failed to update inspection type: ${error.message}`);
    } finally {
        client.release();
    }
};

// Delete an inspection type
export const deleteInspectionTypeService = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Check if type is being used in any inspection stages
        const checkUsageQuery = `
            SELECT COUNT(*) FROM inspection_stages
            WHERE inspection_type_id = $1
        `;
        const checkUsageResult = await client.query(checkUsageQuery, [id]);
        
        if (parseInt(checkUsageResult.rows[0].count) > 0) {
            throw new Error('Cannot delete inspection type that is in use');
        }
        
        // Delete type
        const deleteQuery = `
            DELETE FROM inspection_types
            WHERE id = $1
            RETURNING *
        `;
        const deleteResult = await client.query(deleteQuery, [id]);
        
        if (deleteResult.rows.length === 0) {
            throw new Error('Inspection type not found');
        }
        
        await client.query('COMMIT');
        return deleteResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database error:', error);
        throw new Error(`Failed to delete inspection type: ${error.message}`);
    } finally {
        client.release();
    }
};
