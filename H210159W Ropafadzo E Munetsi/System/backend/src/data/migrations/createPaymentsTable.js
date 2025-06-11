import pool from "../../config/db.js";

/**
 * Migration script to create payments table
 */
const createPaymentsTable = async () => {
  try {
    console.log("Starting migration: Creating payments table");
    
    // Check if table already exists
    const checkTableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'payments';
    `;
    
    const checkResult = await pool.query(checkTableQuery);
    
    if (checkResult.rows.length === 0) {
      // Table doesn't exist, create it
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          amount DECIMAL(15, 2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'mobile_money')),
          payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
          reference_number VARCHAR(100),
          invoice_file_name VARCHAR(255),
          invoice_file_type VARCHAR(50),
          invoice_file_size INTEGER,
          invoice_file_data BYTEA,
          payment_date TIMESTAMPTZ,
          verification_date TIMESTAMPTZ,
          verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_payments_application_id ON payments(application_id);
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON payments(payment_status);
      `;
      
      await pool.query(createTableQuery);
      console.log("Migration successful: payments table created");
    } else {
      console.log("Migration skipped: payments table already exists");
    }
    
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default createPaymentsTable;
