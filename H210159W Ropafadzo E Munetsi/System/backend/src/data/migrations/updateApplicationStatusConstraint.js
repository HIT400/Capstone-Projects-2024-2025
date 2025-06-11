import pool from '../../config/db.js';

const updateApplicationStatusConstraint = async () => {
  try {
    // Check if the applications table exists
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'applications'
      );
    `;
    
    const tableResult = await pool.query(checkTableQuery);
    
    if (tableResult.rows[0].exists) {
      console.log("Applications table exists, checking constraint...");
      
      // Check the current constraint
      const checkConstraintQuery = `
        SELECT pg_get_constraintdef(oid) AS pg_get_constraintdef
        FROM pg_constraint
        WHERE conname = 'applications_status_check'
        AND conrelid = 'applications'::regclass;
      `;
      
      const constraintResult = await pool.query(checkConstraintQuery);
      
      if (constraintResult.rows.length > 0) {
        console.log("Current constraint:", constraintResult.rows[0]);
        
        // Drop the existing constraint
        await pool.query(`
          ALTER TABLE applications 
          DROP CONSTRAINT applications_status_check;
        `);
        
        // Add the new constraint with 'pending'
        await pool.query(`
          ALTER TABLE applications 
          ADD CONSTRAINT applications_status_check 
          CHECK (status IN ('draft', 'pending', 'submitted', 'in_review', 'approved', 'rejected', 'completed'));
        `);
        
        console.log("Migration successful: applications_status_check constraint updated to include 'pending'");
      } else {
        console.log("Constraint applications_status_check not found");
      }
    } else {
      console.log("Migration skipped: applications table does not exist");
    }
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default updateApplicationStatusConstraint;
