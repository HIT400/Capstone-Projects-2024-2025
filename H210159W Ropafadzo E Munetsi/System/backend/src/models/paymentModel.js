import pool from "../config/db.js";

export const getAllPaymentsService = async () => {
  const result = await pool.query(`
    SELECT p.*, a.stand_number, u.email, u.first_name, u.last_name
    FROM payments p
    JOIN applications a ON p.application_id = a.id
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
  `);
  return result.rows;
};

export const getPaymentsByUserService = async (userId, paymentType = null) => {
  let query = `
    SELECT p.*, a.stand_number, a.status as application_status
    FROM payments p
    JOIN applications a ON p.application_id = a.id
    WHERE p.user_id = $1
  `;

  const params = [userId];

  // Add payment type filter if provided
  if (paymentType) {
    query += ` AND p.payment_type = $2`;
    params.push(paymentType);
  }

  query += ` ORDER BY p.created_at DESC`;

  const result = await pool.query(query, params);
  return result.rows;
};

export const getPaymentsByApplicationService = async (applicationId) => {
  const result = await pool.query(`
    SELECT * FROM payments
    WHERE application_id = $1
    ORDER BY created_at DESC
  `, [applicationId]);
  return result.rows;
};

export const getPaymentByIdService = async (id) => {
  const result = await pool.query(`
    SELECT p.*, a.stand_number, u.email, u.first_name, u.last_name
    FROM payments p
    JOIN applications a ON p.application_id = a.id
    JOIN users u ON p.user_id = u.id
    WHERE p.id = $1
  `, [id]);
  return result.rows[0];
};

export const createPaymentService = async ({
  applicationId,
  userId,
  amount,
  paymentMethod,
  referenceNumber = null,
  invoiceFileName = null,
  invoiceFileType = null,
  invoiceFileSize = null,
  invoiceFileData = null,
  notes = null,
  paymentType = 'plan',
  stageDescription = null,
  paynowPollUrl = null,
  paynowReference = null
}) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const paymentResult = await client.query(`
      INSERT INTO payments (
        application_id,
        user_id,
        amount,
        payment_method,
        reference_number,
        invoice_file_name,
        invoice_file_type,
        invoice_file_size,
        invoice_file_data,
        notes,
        payment_type,
        stage_description,
        paynow_poll_url,
        paynow_reference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `, [
      applicationId,
      userId,
      amount,
      paymentMethod,
      referenceNumber,
      invoiceFileName,
      invoiceFileType,
      invoiceFileSize,
      invoiceFileData,
      notes,
      paymentType,
      stageDescription,
      paynowPollUrl,
      paynowReference
    ]);

    await client.query('COMMIT');
    return paymentResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updatePaymentStatusService = async (id, status, verifiedBy = null) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateData = {
      status,
      verificationDate: status === 'completed' ? 'NOW()' : null,
      verifiedBy: status === 'completed' ? verifiedBy : null
    };

    const result = await client.query(`
      UPDATE payments
      SET
        payment_status = $1,
        verification_date = ${updateData.verificationDate || 'verification_date'},
        verified_by = $2,
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, updateData.verifiedBy, id]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deletePaymentService = async (id) => {
  const result = await pool.query('DELETE FROM payments WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

export const getPaymentByPollUrlService = async (pollUrl) => {
  const result = await pool.query(`
    SELECT p.*, a.stand_number, u.email, u.first_name, u.last_name
    FROM payments p
    JOIN applications a ON p.application_id = a.id
    JOIN users u ON p.user_id = u.id
    WHERE p.paynow_poll_url = $1
  `, [pollUrl]);
  return result.rows[0];
};

export const getPaymentByReferenceService = async (reference) => {
  const result = await pool.query(`
    SELECT p.*, a.stand_number, u.email, u.first_name, u.last_name
    FROM payments p
    JOIN applications a ON p.application_id = a.id
    JOIN users u ON p.user_id = u.id
    WHERE p.reference_number = $1
  `, [reference]);
  return result.rows[0];
};

export const updatePaymentService = async (id, updateData) => {
  // Build the SET clause dynamically based on the provided update data
  const updates = [];
  const values = [id]; // First parameter is the payment ID
  let paramIndex = 2; // Start parameter index at 2 (after the ID)

  // Add each field to the updates array if it exists in updateData
  if (updateData.payment_status !== undefined) {
    updates.push(`payment_status = $${paramIndex++}`);
    values.push(updateData.payment_status);
  }

  if (updateData.paynow_status !== undefined) {
    updates.push(`paynow_status = $${paramIndex++}`);
    values.push(updateData.paynow_status);
  }

  if (updateData.paynow_reference !== undefined) {
    updates.push(`paynow_reference = $${paramIndex++}`);
    values.push(updateData.paynow_reference);
  }

  if (updateData.amount !== undefined) {
    updates.push(`amount = $${paramIndex++}`);
    values.push(updateData.amount);
  }

  if (updateData.payment_method !== undefined) {
    updates.push(`payment_method = $${paramIndex++}`);
    values.push(updateData.payment_method);
  }

  if (updateData.phone !== undefined) {
    updates.push(`phone = $${paramIndex++}`);
    values.push(updateData.phone);
  }

  if (updateData.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(updateData.email);
  }

  // Always update the updated_at timestamp
  updates.push(`updated_at = NOW()`);

  // If no updates were provided, return null
  if (updates.length === 0) {
    return null;
  }

  // Build and execute the query
  const query = `
    UPDATE payments
    SET ${updates.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};
