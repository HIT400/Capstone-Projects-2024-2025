// fixConstraint.js - ES Module version
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool();

async function fixUserRoleConstraint() {
  try {
    console.log("Starting to fix users role constraint");

    // First, check if the table exists
    const checkTableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'users';
    `;

    const checkResult = await pool.query(checkTableQuery);

    if (checkResult.rows.length > 0) {
      // Table exists, now check the current constraint
      const checkConstraintQuery = `
        SELECT conname, pg_get_constraintdef(oid)
        FROM pg_constraint
        WHERE conrelid = 'users'::regclass
        AND contype = 'c'
        AND conname = 'users_role_check';
      `;

      const constraintResult = await pool.query(checkConstraintQuery);

      if (constraintResult.rows.length > 0) {
        console.log("Current constraint:", constraintResult.rows[0]);

        // Drop the existing constraint
        await pool.query(`
          ALTER TABLE users
          DROP CONSTRAINT users_role_check;
        `);

        // Add the new constraint with superadmin
        await pool.query(`
          ALTER TABLE users
          ADD CONSTRAINT users_role_check
          CHECK (role IN ('admin', 'applicant', 'inspector', 'superadmin'));
        `);

        console.log("Fix successful: users_role_check constraint updated");
      } else {
        console.log("Constraint users_role_check not found");
      }
    } else {
      console.log("Fix skipped: users table does not exist");
    }
  } catch (error) {
    console.error("Fix failed:", error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixUserRoleConstraint();
