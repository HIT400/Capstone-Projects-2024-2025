import pool from "../../config/db.js";

/**
 * Migration script to add inspection_type_id to inspection_stages table
 */
const addInspectionTypeToStages = async () => {
  const client = await pool.connect();
  try {
    console.log("Starting migration: Adding inspection_type_id to inspection_stages table");
    
    await client.query('BEGIN');
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'inspection_stages' AND column_name = 'inspection_type_id';
    `;
    
    const checkResult = await client.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      // Column doesn't exist, add it
      const alterTableQuery = `
        ALTER TABLE inspection_stages 
        ADD COLUMN inspection_type_id INTEGER REFERENCES inspection_types(id) ON DELETE SET NULL;
      `;
      
      await client.query(alterTableQuery);
      
      // Update existing inspection stages with appropriate inspection type IDs
      const updateStagesQuery = `
        -- Update Siting and Foundations stages to Foundation type
        UPDATE inspection_stages 
        SET inspection_type_id = (SELECT id FROM inspection_types WHERE name = 'Foundation')
        WHERE name LIKE '%Siting and Foundations%';
        
        -- Update DPC Level, Lintel Level and Wall plate Level stages to Structural type
        UPDATE inspection_stages 
        SET inspection_type_id = (SELECT id FROM inspection_types WHERE name = 'Structural')
        WHERE name LIKE '%DPC Level%' OR name LIKE '%Lintel Level%' OR name LIKE '%Wall plate Level%';
        
        -- Update Roof Trusses stages to Structural type
        UPDATE inspection_stages 
        SET inspection_type_id = (SELECT id FROM inspection_types WHERE name = 'Structural')
        WHERE name LIKE '%Roof Trusses%';
        
        -- Update Drain Open Test and Final Test stages to Final type
        UPDATE inspection_stages 
        SET inspection_type_id = (SELECT id FROM inspection_types WHERE name = 'Final')
        WHERE name LIKE '%Drain Open Test%' OR name LIKE '%Final Test%';
      `;
      
      await client.query(updateStagesQuery);
      
      await client.query('COMMIT');
      console.log("Migration successful: inspection_type_id added to inspection_stages table");
    } else {
      await client.query('ROLLBACK');
      console.log("Migration skipped: inspection_type_id already exists in inspection_stages table");
    }
    
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

export default addInspectionTypeToStages;

// Run this function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  try {
    await addInspectionTypeToStages();
    console.log('Inspection type to stages migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
