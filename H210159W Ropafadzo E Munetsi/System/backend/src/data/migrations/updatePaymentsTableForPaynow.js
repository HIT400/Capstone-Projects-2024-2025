import pool from "../../config/db.js";

/**
 * Migration script to update payments table for PayNow integration
 */
const updatePaymentsTableForPaynow = async () => {
  try {
    console.log("Starting migration: Updating payments table for PayNow integration");
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if payment_method constraint exists and drop it
      const dropConstraintQuery = `
        DO $$
        BEGIN
          IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'payments_payment_method_check'
          ) THEN
            ALTER TABLE payments DROP CONSTRAINT payments_payment_method_check;
          END IF;
        END $$;
      `;
      
      await client.query(dropConstraintQuery);
      
      // Check if payment_type column exists
      const checkPaymentTypeQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'payment_type';
      `;
      
      const paymentTypeResult = await client.query(checkPaymentTypeQuery);
      
      if (paymentTypeResult.rows.length === 0) {
        // Add payment_type column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN payment_type VARCHAR(50) NOT NULL DEFAULT 'plan' 
          CHECK (payment_type IN ('plan', 'stage'));
        `);
      }
      
      // Check if stage_description column exists
      const checkStageDescriptionQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'stage_description';
      `;
      
      const stageDescriptionResult = await client.query(checkStageDescriptionQuery);
      
      if (stageDescriptionResult.rows.length === 0) {
        // Add stage_description column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN stage_description TEXT;
        `);
      }
      
      // Check if paynow_poll_url column exists
      const checkPollUrlQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'paynow_poll_url';
      `;
      
      const pollUrlResult = await client.query(checkPollUrlQuery);
      
      if (pollUrlResult.rows.length === 0) {
        // Add paynow_poll_url column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN paynow_poll_url TEXT;
        `);
      }
      
      // Check if paynow_reference column exists
      const checkPaynowReferenceQuery = `
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'payments' AND column_name = 'paynow_reference';
      `;
      
      const paynowReferenceResult = await client.query(checkPaynowReferenceQuery);
      
      if (paynowReferenceResult.rows.length === 0) {
        // Add paynow_reference column
        await client.query(`
          ALTER TABLE payments 
          ADD COLUMN paynow_reference TEXT;
        `);
      }
      
      // Add new payment_method constraint with PayNow options
      await client.query(`
        ALTER TABLE payments 
        ADD CONSTRAINT payments_payment_method_check 
        CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'mobile_money', 'paynow', 'paynow_ecocash', 'paynow_onemoney', 'paynow_innbucks'));
      `);
      
      // Create index for paynow_poll_url
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_payments_paynow_poll_url ON payments(paynow_poll_url);
      `);
      
      await client.query('COMMIT');
      console.log("Migration successful: payments table updated for PayNow integration");
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

export default updatePaymentsTableForPaynow;
