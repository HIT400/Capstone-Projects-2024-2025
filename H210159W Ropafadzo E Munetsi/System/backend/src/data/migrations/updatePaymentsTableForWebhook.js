import pool from "../../config/db.js";

/**
 * Migration script to update payments table for PayNow webhook handling
 */
const updatePaymentsTableForWebhook = async () => {
  try {
    console.log("Starting migration: Updating payments table for PayNow webhook handling");
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if phone column exists
      const checkPhoneQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'phone';
      `;
      
      const phoneResult = await client.query(checkPhoneQuery);
      
      if (phoneResult.rows.length === 0) {
        // Add phone column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN phone VARCHAR(20);
        `);
      }
      
      // Check if email column exists
      const checkEmailQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'email';
      `;
      
      const emailResult = await client.query(checkEmailQuery);
      
      if (emailResult.rows.length === 0) {
        // Add email column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN email VARCHAR(100);
        `);
      }
      
      // Check if paynow_status column exists
      const checkPaynowStatusQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'paynow_status';
      `;
      
      const paynowStatusResult = await client.query(checkPaynowStatusQuery);
      
      if (paynowStatusResult.rows.length === 0) {
        // Add paynow_status column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN paynow_status VARCHAR(50);
        `);
      }
      
      await client.query('COMMIT');
      console.log("Migration successful: payments table updated for PayNow webhook handling");
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Migration failed:", error);
      throw error;
    } finally {
      client.release();
    }
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default updatePaymentsTableForWebhook;
