import pool from "../../config/db.js";

/**
 * Creates the payment_settings table to store default payment amounts
 */
const createPaymentSettingsTable = async () => {
  try {
    // Check if the table already exists
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'payment_settings'
      );
    `);
    
    if (checkResult.rows[0].exists) {
      console.log("Migration skipped: payment_settings table already exists");
      return true;
    }
    
    // Create the payment_settings table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS payment_settings (
        id SERIAL PRIMARY KEY,
        payment_type VARCHAR(50) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      CREATE INDEX idx_payment_settings_type ON payment_settings(payment_type);
    `;
    
    await pool.query(createTableQuery);
    
    // Insert default payment settings
    const insertDefaultsQuery = `
      INSERT INTO payment_settings (payment_type, amount, description)
      VALUES 
        ('plan_approval', 200.00, 'Plan Approval Payment'),
        ('stage_payments', 170.00, 'Inspection Stages Payment');
    `;
    
    await pool.query(insertDefaultsQuery);
    
    console.log("Migration successful: payment_settings table created with default values");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default createPaymentSettingsTable;
