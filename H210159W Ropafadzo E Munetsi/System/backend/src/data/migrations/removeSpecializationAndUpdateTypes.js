import pool from '../../config/db.js';

export const removeSpecializationAndUpdateTypes = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Starting migration: Removing specialization field and updating inspection types');

        // Check if specialization column exists in inspectors table
        const checkSpecializationQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'inspectors' AND column_name = 'specialization';
        `;
        
        const specializationResult = await client.query(checkSpecializationQuery);
        
        if (specializationResult.rows.length > 0) {
            // Remove specialization column from inspectors table
            await client.query(`
                ALTER TABLE inspectors DROP COLUMN IF EXISTS specialization;
            `);
            console.log('Removed specialization column from inspectors table');
        } else {
            console.log('Specialization column does not exist in inspectors table');
        }

        // Delete plumbing and electrical inspection types
        await client.query(`
            DELETE FROM inspection_types 
            WHERE name IN ('Plumbing', 'Electrical');
        `);
        console.log('Removed Plumbing and Electrical inspection types');

        // Update any inspectors that had these types to use 'General' instead
        await client.query(`
            UPDATE inspectors 
            SET inspection_type = 'General' 
            WHERE inspection_type IN ('Plumbing', 'Electrical');
        `);
        console.log('Updated inspectors with removed inspection types to use General type');

        await client.query('COMMIT');
        console.log('Migration successful: Removed specialization and updated inspection types');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
    }
};

export default removeSpecializationAndUpdateTypes;
