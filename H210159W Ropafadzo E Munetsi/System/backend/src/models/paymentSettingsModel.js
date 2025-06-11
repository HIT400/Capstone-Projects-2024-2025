import pool from "../config/db.js";

/**
 * Get all payment settings
 */
export const getAllPaymentSettingsService = async () => {
  const result = await pool.query(`
    SELECT * FROM payment_settings
    ORDER BY payment_type
  `);
  return result.rows;
};

/**
 * Get payment setting by type
 * @param {string} paymentType - The type of payment (e.g., 'plan_approval', 'stage_payments')
 */
export const getPaymentSettingByTypeService = async (paymentType) => {
  const result = await pool.query(`
    SELECT * FROM payment_settings
    WHERE payment_type = $1 AND is_active = TRUE
    LIMIT 1
  `, [paymentType]);
  return result.rows[0];
};

/**
 * Create a new payment setting
 * @param {Object} paymentSetting - The payment setting object
 */
export const createPaymentSettingService = async ({
  paymentType,
  amount,
  description,
  createdBy
}) => {
  const result = await pool.query(`
    INSERT INTO payment_settings (
      payment_type,
      amount,
      description,
      created_by
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [
    paymentType,
    amount,
    description,
    createdBy
  ]);
  return result.rows[0];
};

/**
 * Update a payment setting
 * @param {string} id - The payment setting ID
 * @param {Object} paymentSetting - The updated payment setting object
 */
export const updatePaymentSettingService = async (id, {
  amount,
  description,
  isActive,
  updatedBy
}) => {
  const result = await pool.query(`
    UPDATE payment_settings
    SET
      amount = $1,
      description = $2,
      is_active = $3,
      updated_by = $4,
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
  `, [
    amount,
    description,
    isActive,
    updatedBy,
    id
  ]);
  return result.rows[0];
};

/**
 * Delete a payment setting
 * @param {string} id - The payment setting ID
 */
export const deletePaymentSettingService = async (id) => {
  const result = await pool.query(`
    DELETE FROM payment_settings
    WHERE id = $1
    RETURNING *
  `, [id]);
  return result.rows[0];
};
