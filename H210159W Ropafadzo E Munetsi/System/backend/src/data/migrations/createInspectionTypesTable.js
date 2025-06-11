import pool from "../../config/db.js";

/**
 * Migration script to create inspection_types table
 */
const createInspectionTypesTable = async () => {
  try {
    console.log("Starting migration: Creating inspection_types table");
    
    // Check if table already exists
    const checkTableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'inspection_types';
    `;
    
    const checkResult = await pool.query(checkTableQuery);
    
    if (checkResult.rows.length === 0) {
      // Table doesn't exist, create it
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS inspection_types (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Insert default inspection types
        INSERT INTO inspection_types (name, description) VALUES
          ('Foundation', 'Foundation inspection including footings, slabs, and foundation walls'),
          ('Structural', 'Structural elements inspection including framing, beams, and columns'),
          ('Electrical', 'Electrical systems inspection including wiring, panels, and fixtures'),
          ('Plumbing', 'Plumbing systems inspection including pipes, fixtures, and drainage'),
          ('Final', 'Final inspection before certificate of occupation'),
          ('General', 'General inspection covering multiple aspects');
      `;
      
      await pool.query(createTableQuery);
      console.log("Migration successful: inspection_types table created with default types");
    } else {
      console.log("Migration skipped: inspection_types table already exists");
    }
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default createInspectionTypesTable;

// Run this function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  try {
    await createInspectionTypesTable();
    console.log('Inspection types table migration completed');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
