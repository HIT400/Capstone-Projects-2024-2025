import simplifyInspectionSystem from './src/data/migrations/simplifyInspectionSystem.js';
import pool from './src/config/db.js';

async function runMigration() {
  try {
    console.log("Starting migration to simplify inspection system...");
    await simplifyInspectionSystem();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
