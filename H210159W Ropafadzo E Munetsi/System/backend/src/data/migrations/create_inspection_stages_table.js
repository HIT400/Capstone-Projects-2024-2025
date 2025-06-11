import pool from '../../config/db.js';

export const createInspectionStagesTable = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if the table already exists
        const tableExistsQuery = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'inspection_stages'
            );
        `;

        const tableExistsResult = await client.query(tableExistsQuery);
        const tableExists = tableExistsResult.rows[0].exists;

        if (!tableExists) {
            // Create inspection_stages table as a reference table
            await client.query(`
                CREATE TABLE IF NOT EXISTS inspection_stages (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    sequence_order INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Insert standard stages
            await client.query(`
                INSERT INTO inspection_stages (name, description, sequence_order) VALUES
                ('Siting and Foundations', 'Inspection of the building site and foundation work', 1),
                ('DPC Level, Lintel Level and Wall plate Level', 'Inspection of damp-proof course, lintels, and wall plates', 2),
                ('Roof Trusses', 'Inspection of roof structure and trusses', 3),
                ('Drain Open Test and Final Test', 'Final inspection for Certificate of Occupation', 4)
            `);

            console.log('Created inspection_stages as a reference table with standard stages');
        } else {
            console.log('inspection_stages table already exists, skipping creation');
        }

        await client.query('COMMIT');
        console.log('Inspection stages table created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating inspection stages table:', error);
        throw error;
    } finally {
        client.release();
    }
};

// Run this function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    try {
        await createInspectionStagesTable();
        console.log('Inspection stages table migration completed');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
