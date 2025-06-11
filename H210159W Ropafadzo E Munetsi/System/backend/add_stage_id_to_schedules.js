import addStageIdToSchedules from './src/data/migrations/add_stage_id_to_schedules.js';
import pool from './src/config/db.js';

async function runMigration() {
  try {
    console.log("Starting migration to add stage_id to inspection_schedules...");
    await addStageIdToSchedules();
    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

runMigration();
