import pool from '../../config/db.js';

/**
 * Migration to simplify the inspection system by:
 * 1. Converting inspection_stages to a reference table with standard stages
 * 2. Enhancing inspection_schedules to include stage information
 */
const simplifyInspectionSystem = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('Starting migration to simplify inspection system...');
    
    // Step 1: Create a backup of existing tables
    console.log('Creating backup of existing tables...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspection_stages_backup AS 
      SELECT * FROM inspection_stages;
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspection_schedules_backup AS 
      SELECT * FROM inspection_schedules;
    `);
    
    console.log('Backups created successfully.');
    
    // Step 2: Check if stage_id column already exists in inspection_schedules
    const checkColumnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inspection_schedules' AND column_name = 'stage_id';
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Add stage_id column to inspection_schedules
      console.log('Adding stage_id column to inspection_schedules table...');
      
      await client.query(`
        ALTER TABLE inspection_schedules 
        ADD COLUMN stage_id INTEGER;
      `);
      
      console.log('Column added successfully.');
    } else {
      console.log('stage_id column already exists in inspection_schedules table.');
    }
    
    // Step 3: Create a temporary reference table for standard inspection stages
    console.log('Creating temporary reference table for standard inspection stages...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS inspection_stages_reference (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sequence_order INTEGER NOT NULL
      );
    `);
    
    // Step 4: Insert standard stages into the reference table
    console.log('Inserting standard stages into reference table...');
    
    await client.query(`
      INSERT INTO inspection_stages_reference (name, description, sequence_order) VALUES
      ('Siting and Foundations', 'Inspection of the building site and foundation work', 1),
      ('DPC Level, Lintel Level and Wall plate Level', 'Inspection of damp-proof course, lintels, and wall plates', 2),
      ('Roof Trusses', 'Inspection of roof structure and trusses', 3),
      ('Drain Open Test and Final Test', 'Final inspection for Certificate of Occupation', 4)
      ON CONFLICT (id) DO NOTHING;
    `);
    
    // Step 5: Update inspection_schedules with stage_id based on existing data
    console.log('Updating inspection_schedules with stage_id based on existing data...');
    
    // First, get all inspection schedules
    const schedulesResult = await client.query(`
      SELECT 
        isc.id AS schedule_id,
        isc.application_id,
        ist.id AS stage_id,
        ist.name AS stage_name
      FROM 
        inspection_schedules isc
      JOIN 
        inspection_stages ist ON isc.application_id = ist.application_id AND isc.inspector_id = ist.inspector_id
      WHERE 
        ist.status = 'scheduled' OR ist.status = 'completed';
    `);
    
    // Update each schedule with the appropriate stage_id
    for (const row of schedulesResult.rows) {
      // Find the matching standard stage
      const stageResult = await client.query(`
        SELECT id FROM inspection_stages_reference 
        WHERE name LIKE $1 OR $1 LIKE '%' || name || '%'
      `, [row.stage_name]);
      
      if (stageResult.rows.length > 0) {
        const standardStageId = stageResult.rows[0].id;
        
        // Update the schedule with the standard stage id
        await client.query(`
          UPDATE inspection_schedules 
          SET stage_id = $1 
          WHERE id = $2
        `, [standardStageId, row.schedule_id]);
        
        console.log(`Updated schedule ${row.schedule_id} with stage_id ${standardStageId}`);
      } else {
        console.log(`Could not find matching standard stage for "${row.stage_name}"`);
      }
    }
    
    // Step 6: Create new inspection_stages table with only standard stages
    console.log('Creating new inspection_stages table with only standard stages...');
    
    // Rename existing table
    await client.query(`ALTER TABLE inspection_stages RENAME TO inspection_stages_old;`);
    
    // Create new table
    await client.query(`
      CREATE TABLE inspection_stages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sequence_order INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Copy data from reference table
    await client.query(`
      INSERT INTO inspection_stages (id, name, description, sequence_order)
      SELECT id, name, description, sequence_order FROM inspection_stages_reference;
    `);
    
    // Step 7: Add NOT NULL constraint to stage_id in inspection_schedules
    console.log('Adding NOT NULL constraint to stage_id in inspection_schedules...');
    
    // First, handle any NULL values
    await client.query(`
      UPDATE inspection_schedules
      SET stage_id = 1
      WHERE stage_id IS NULL;
    `);
    
    // Add foreign key constraint
    await client.query(`
      ALTER TABLE inspection_schedules
      ADD CONSTRAINT fk_inspection_stage
      FOREIGN KEY (stage_id)
      REFERENCES inspection_stages(id);
    `);
    
    // Add NOT NULL constraint
    await client.query(`
      ALTER TABLE inspection_schedules
      ALTER COLUMN stage_id SET NOT NULL;
    `);
    
    // Step 8: Drop temporary reference table
    console.log('Dropping temporary reference table...');
    
    await client.query(`DROP TABLE inspection_stages_reference;`);
    
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

export default simplifyInspectionSystem;

// Run this function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  try {
    await simplifyInspectionSystem();
    console.log('Inspection system simplification completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
