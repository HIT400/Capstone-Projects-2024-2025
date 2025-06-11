import pool from "../../config/db.js";

/**
 * Migration script to add extraction_metadata column to documents table
 */
const addExtractionMetadataColumn = async () => {
  try {
    console.log("Starting migration: Adding extraction_metadata column to documents table");
    
    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'extraction_metadata';
    `;
    
    const checkResult = await pool.query(checkColumnQuery);
    
    if (checkResult.rows.length === 0) {
      // Column doesn't exist, add it
      const addColumnQuery = `
        ALTER TABLE documents 
        ADD COLUMN extraction_metadata JSONB;
      `;
      
      await pool.query(addColumnQuery);
      console.log("Migration successful: extraction_metadata column added to documents table");
    } else {
      console.log("Migration skipped: extraction_metadata column already exists");
    }
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default addExtractionMetadataColumn;
