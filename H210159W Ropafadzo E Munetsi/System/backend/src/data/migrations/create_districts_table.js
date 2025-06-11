import pool from '../../config/db.js';

export const createDistrictsTable = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create districts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS districts (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Check if the table is empty
        const checkResult = await client.query('SELECT COUNT(*) FROM districts');
        
        // If the table is empty, seed it with initial data
        if (parseInt(checkResult.rows[0].count) === 0) {
            const districts = [
                { name: 'Harare Central', description: 'Central business district of Harare' },
                { name: 'Harare South', description: 'Southern region of Harare' },
                { name: 'Harare North', description: 'Northern region of Harare' },
                { name: 'Harare East', description: 'Eastern region of Harare' },
                { name: 'Harare West', description: 'Western region of Harare' },
                { name: 'Chitungwiza', description: 'Satellite town of Harare' },
                { name: 'Epworth', description: 'Suburb of Harare' },
                { name: 'Ruwa', description: 'Town east of Harare' },
                { name: 'Norton', description: 'Town west of Harare' }
            ];

            for (const district of districts) {
                await client.query(
                    'INSERT INTO districts (name, description) VALUES ($1, $2)',
                    [district.name, district.description]
                );
            }

            console.log('Districts table seeded with initial data');
        }

        await client.query('COMMIT');
        console.log('Districts table created successfully');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating districts table:', error);
        throw error;
    } finally {
        client.release();
    }
};

export default createDistrictsTable;
