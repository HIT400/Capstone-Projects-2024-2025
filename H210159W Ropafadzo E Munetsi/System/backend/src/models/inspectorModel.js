import pool from "../config/db.js";
import bcrypt from 'bcryptjs';

const saltRounds = 10;

export const getAllInspectorsService = async () => {
    try {
        // Join with users table to get user details
        const query = `
            SELECT i.*, u.email, u.first_name, u.last_name, u.contact_number, u.physical_address
            FROM inspectors i
            JOIN users u ON i.user_id = u.id
        `;
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        throw new Error(`Failed to fetch inspectors: ${err.message}`);
    }
};

export const getInspectorByIdService = async (id) => {
    try {
        const query = `
            SELECT i.*, u.email, u.first_name, u.last_name, u.contact_number, u.physical_address
            FROM inspectors i
            JOIN users u ON i.user_id = u.id
            WHERE i.user_id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        throw new Error(`Failed to fetch inspector: ${err.message}`);
    }
};

export const createInspectorService = async (inspectorData) => {
    const client = await pool.connect();
    try {
        console.log('Creating inspector in database with data:', JSON.stringify(inspectorData, null, 2));
        await client.query('BEGIN');

        // Check if the user already exists and has an admin or superadmin role
        const checkUserQuery = `
            SELECT id, role FROM users WHERE email = $1
        `;
        const userCheckResult = await client.query(checkUserQuery, [inspectorData.email]);

        if (userCheckResult.rows.length > 0) {
            const existingUser = userCheckResult.rows[0];
            if (existingUser.role === 'admin' || existingUser.role === 'superadmin') {
                throw new Error('Admin and superadmin users cannot be inspectors');
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(inspectorData.password, saltRounds);
        console.log('Password hashed successfully');

        // First create user
        const userQuery = `
            INSERT INTO users (
                email, password_hash, role, first_name, last_name,
                contact_number, physical_address, national_id_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;
        `;

        const userValues = [
            inspectorData.email,
            hashedPassword,
            'inspector',
            inspectorData.first_name,
            inspectorData.last_name,
            inspectorData.contact_number,
            inspectorData.physical_address,
            inspectorData.national_id_number
        ];

        console.log('Executing user insert query with values:', userValues);
        const userResult = await client.query(userQuery, userValues);
        console.log('User created successfully with ID:', userResult.rows[0].id);
        const userId = userResult.rows[0].id;

        // Then create inspector
        const inspectorQuery = `
            INSERT INTO inspectors (
                user_id, work_id, license_number,
                available, assigned_district, inspection_type
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const inspectorValues = [
            userId,
            inspectorData.work_id,
            inspectorData.license_number || '',
            inspectorData.available !== undefined ? inspectorData.available : true,
            inspectorData.assigned_district,
            inspectorData.inspection_type
        ];

        console.log('Executing inspector insert query with values:', inspectorValues);
        const inspectorResult = await client.query(inspectorQuery, inspectorValues);
        console.log('Inspector created successfully');

        await client.query('COMMIT');
        console.log('Transaction committed successfully');

        // Combine user and inspector data in response
        return {
            ...userResult.rows[0],
            ...inspectorResult.rows[0]
        };
    } catch (err) {
        await client.query('ROLLBACK');

        // Provide more detailed error messages for common database errors
        if (err.code === '23505') { // Unique violation
            if (err.constraint === 'users_email_key') {
                throw new Error('Email address is already in use');
            } else if (err.constraint === 'users_national_id_number_key') {
                throw new Error('National ID number is already in use');
            } else if (err.constraint === 'inspectors_work_id_key') {
                throw new Error('Work ID is already in use');
            } else if (err.constraint === 'inspectors_license_number_key') {
                throw new Error('License number is already in use');
            } else {
                throw new Error(`Unique constraint violation: ${err.constraint}`);
            }
        } else if (err.code === '23514') { // Check constraint violation
            throw new Error(`Validation error: ${err.detail || err.message}`);
        } else {
            console.error('Database error details:', err);
            throw new Error(`Failed to create inspector: ${err.message}`);
        }
    } finally {
        client.release();
    }
};

export const updateInspectorService = async (id, updateData) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if the user is an admin or superadmin
        const checkUserQuery = `
            SELECT role FROM users WHERE id = $1
        `;
        const userCheckResult = await client.query(checkUserQuery, [id]);

        if (userCheckResult.rows.length > 0) {
            const existingUser = userCheckResult.rows[0];
            if (existingUser.role === 'admin' || existingUser.role === 'superadmin') {
                throw new Error('Admin and superadmin users cannot be inspectors');
            }
        }

        // Update user table if user fields are present
        if (updateData.first_name || updateData.last_name || updateData.contact_number) {
            const userQuery = `
                UPDATE users SET
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    contact_number = COALESCE($4, contact_number),
                    updated_at = NOW()
                WHERE id = $1
            `;
            await client.query(userQuery, [
                id,
                updateData.first_name,
                updateData.last_name,
                updateData.contact_number
            ]);
        }

        // Update inspector table
        const inspectorQuery = `
            UPDATE inspectors SET
                work_id = COALESCE($2, work_id),
                license_number = COALESCE($3, license_number),
                available = COALESCE($4, available),
                assigned_district = COALESCE($5, assigned_district),
                inspection_type = COALESCE($6, inspection_type),
                updated_at = NOW()
            WHERE user_id = $1
            RETURNING *;
        `;

        const result = await client.query(inspectorQuery, [
            id,
            updateData.work_id,
            updateData.license_number,
            updateData.available,
            updateData.assigned_district,
            updateData.inspection_type
        ]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Failed to update inspector: ${err.message}`);
    } finally {
        client.release();
    }
};

export const deleteInspectorService = async (id) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // This will cascade delete from inspectors table due to the foreign key constraint
        const result = await client.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );

        await client.query('COMMIT');
        return result.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Failed to delete inspector: ${err.message}`);
    } finally {
        client.release();
    }
};