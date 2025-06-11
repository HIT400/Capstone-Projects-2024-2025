import updateApplicationStatusConstraint from './src/data/migrations/updateApplicationStatusConstraint.js';
import pool from './src/config/db.js';

async function runMigration() {
  try {
    console.log("Starting migration to update application status constraint...");
    await updateApplicationStatusConstraint();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
