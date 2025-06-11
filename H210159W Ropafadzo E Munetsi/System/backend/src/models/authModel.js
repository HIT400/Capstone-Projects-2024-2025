import pool from "../config/db.js";

export const getAllUsersService = async () => {
    const result = await pool.query("SELECT * FROM users");
    return result.rows; 
};

export const getUserByIDService = async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
};

export const getUserByEmailService = async (email) => {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
};

export const registerUserService = async (
    email,
    passwordHash,
    firstName,
    lastName,
    contactNumber,
    physicalAddress,
    nationalIdNumber,
    role = 'applicant' // Default role is applicant
) => {
    const query = `
        INSERT INTO users (
            email,
            password_hash,
            role,
            first_name,
            last_name,
            contact_number,
            physical_address,
            national_id_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    const values = [
        email,
        passwordHash,
        role,
        firstName,
        lastName,
        contactNumber,
        physicalAddress,
        nationalIdNumber
    ];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw new Error(`Database error: ${err.message}`);
    }
};

export const updateUserRoleService = async (id, newRole) => {
    const query = `
        UPDATE users
        SET role = $1
        WHERE id = $2
        RETURNING *;
    `;

    const result = await pool.query(query, [newRole, id]);
    return result.rows[0];
};

export const deleteUserService = async (id) => {
    const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
};

export const loginUserService = async (email) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );
    return result.rows[0];
};

export const updatePasswordService = async (id, newPasswordHash) => {
    const result = await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *",
        [newPasswordHash, id]
    );
    return result.rows[0];
};

export const resetPasswordTokenService = async (id, token, expiresAt) => {
    const result = await pool.query(
        "UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE id = $3 RETURNING *",
        [token, expiresAt, id]
    );
    return result.rows[0];
};

export const getUserByResetTokenService = async (token) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()",
        [token]
    );
    return result.rows[0];
};

export const clearResetTokenService = async (id) => {
    const result = await pool.query(
        "UPDATE users SET reset_password_token = NULL, reset_password_expires = NULL WHERE id = $1 RETURNING *",
        [id]
    );
    return result.rows[0];
};