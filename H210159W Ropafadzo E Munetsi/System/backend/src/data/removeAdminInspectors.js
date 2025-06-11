import pool from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to remove admin and superadmin users from the inspectors table
 */
const removeAdminInspectors = async () => {
    const client = await pool.connect();
    try {
        console.log('Starting removal of admin and superadmin users from inspectors table...');
        
        // Begin transaction
        await client.query('BEGIN');
        
        // Find admin and superadmin users who are also inspectors
        const findQuery = `
            SELECT u.id, u.email, u.role 
            FROM users u
            JOIN inspectors i ON u.id = i.user_id
            WHERE u.role IN ('admin', 'superadmin')
        `;
        
        const result = await client.query(findQuery);
        
        if (result.rows.length === 0) {
            console.log('No admin or superadmin users found in inspectors table.');
        } else {
            console.log(`Found ${result.rows.length} admin/superadmin users in inspectors table:`);
            
            for (const user of result.rows) {
                console.log(`- User ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
                
                // Delete from inspectors table
                const deleteQuery = `
                    DELETE FROM inspectors
                    WHERE user_id = $1
                    RETURNING user_id
                `;
                
                const deleteResult = await client.query(deleteQuery, [user.id]);
                
                if (deleteResult.rows.length > 0) {
                    console.log(`✓ Removed user ID ${user.id} from inspectors table`);
                } else {
                    console.log(`✗ Failed to remove user ID ${user.id} from inspectors table`);
                }
            }
        }
        
        // Commit transaction
        await client.query('COMMIT');
        console.log('Transaction committed successfully');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error removing admin inspectors:', error);
    } finally {
        client.release();
        // Close the pool
        pool.end();
    }
};

// Run the function
removeAdminInspectors()
    .then(() => console.log('Script completed'))
    .catch(err => console.error('Script failed:', err));
