import pool from '../../config/db.js';

/**
 * Migration to add stage_id column to inspection_schedules table
 * and populate it with appropriate values
 */
const addStageIdToSchedules = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting migration to add stage_id to inspection_schedules...');
    
    // Check if stage_id column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inspection_schedules' AND column_name = 'stage_id';
    `;
    
    const columnResult = await client.query(checkColumnQuery);
    
    if (columnResult.rows.length === 0) {
      console.log('stage_id column does not exist, adding it...');
      
      // Add stage_id column
      await client.query(`
        ALTER TABLE inspection_schedules 
        ADD COLUMN stage_id INTEGER;
      `);
      
      console.log('Column added successfully.');
      
      // Check if inspection_stages table exists and has the expected structure
      const checkStagesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'inspection_stages';
      `;
      
      const stagesResult = await client.query(checkStagesQuery);
      
      if (stagesResult.rows.length === 0) {
        console.log('inspection_stages table does not exist, creating it...');
        
        // Create inspection_stages table
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
        
        console.log('Created inspection_stages table with standard stages.');
      } else {
        console.log('inspection_stages table already exists.');
      }
      
      // Populate stage_id based on existing data
      console.log('Populating stage_id values...');
      
      // Get all schedules
      const schedulesQuery = `
        SELECT id, application_id, inspector_id 
        FROM inspection_schedules
        WHERE stage_id IS NULL
      `;
      
      const schedulesResult = await client.query(schedulesQuery);
      
      if (schedulesResult.rows.length > 0) {
        console.log(`Found ${schedulesResult.rows.length} schedules that need stage_id values.`);
        
        // For each schedule, try to determine the appropriate stage
        for (const schedule of schedulesResult.rows) {
          // Check if there's a corresponding stage in the old inspection_stages table
          const oldStageQuery = `
            SELECT name 
            FROM inspection_stages_old 
            WHERE application_id = $1 AND inspector_id = $2 AND status = 'scheduled'
            LIMIT 1
          `;
          
          try {
            const oldStageResult = await client.query(oldStageQuery, [
              schedule.application_id, 
              schedule.inspector_id
            ]);
            
            if (oldStageResult.rows.length > 0) {
              const stageName = oldStageResult.rows[0].name;
              
              // Find the matching standard stage
              const standardStageQuery = `
                SELECT id 
                FROM inspection_stages 
                WHERE name LIKE $1 OR $1 LIKE '%' || name || '%'
                LIMIT 1
              `;
              
              const standardStageResult = await client.query(standardStageQuery, [stageName]);
              
              if (standardStageResult.rows.length > 0) {
                const stageId = standardStageResult.rows[0].id;
                
                // Update the schedule with the stage_id
                await client.query(`
                  UPDATE inspection_schedules 
                  SET stage_id = $1 
                  WHERE id = $2
                `, [stageId, schedule.id]);
                
                console.log(`Updated schedule ${schedule.id} with stage_id ${stageId}`);
              } else {
                // Default to first stage if no match
                await client.query(`
                  UPDATE inspection_schedules 
                  SET stage_id = 1 
                  WHERE id = $1
                `, [schedule.id]);
                
                console.log(`Updated schedule ${schedule.id} with default stage_id 1`);
              }
            } else {
              // Default to first stage if no old stage found
              await client.query(`
                UPDATE inspection_schedules 
                SET stage_id = 1 
                WHERE id = $1
              `, [schedule.id]);
              
              console.log(`Updated schedule ${schedule.id} with default stage_id 1`);
            }
          } catch (error) {
            // If inspection_stages_old doesn't exist, just use default stage
            await client.query(`
              UPDATE inspection_schedules 
              SET stage_id = 1 
              WHERE id = $1
            `, [schedule.id]);
            
            console.log(`Updated schedule ${schedule.id} with default stage_id 1`);
          }
        }
      } else {
        console.log('No schedules found that need stage_id values.');
      }
      
      // Add NOT NULL constraint and foreign key
      console.log('Adding NOT NULL constraint and foreign key...');
      
      await client.query(`
        ALTER TABLE inspection_schedules 
        ALTER COLUMN stage_id SET NOT NULL;
      `);
      
      await client.query(`
        ALTER TABLE inspection_schedules 
        ADD CONSTRAINT fk_inspection_stage 
        FOREIGN KEY (stage_id) 
        REFERENCES inspection_stages(id);
      `);
      
      console.log('Constraints added successfully.');
    } else {
      console.log('stage_id column already exists, skipping migration.');
    }
    
    await client.query('COMMIT');
    console.log('Migration completed successfully!');
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default addStageIdToSchedules;

// Run this function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  try {
    await addStageIdToSchedules();
    console.log('Migration to add stage_id completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
