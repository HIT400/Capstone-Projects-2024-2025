import pool from "../../config/db.js";

/**
 * Migration script to create inspection_schedules table
 */
const createInspectionScheduleTable = async () => {
  try {
    console.log("Starting migration: Creating inspection_schedules table");

    // Check if table already exists
    const checkTableQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'inspection_schedules';
    `;

    const checkResult = await pool.query(checkTableQuery);

    if (checkResult.rows.length === 0) {
      // Table doesn't exist, create it
      // First, check if inspection_stages table exists
      const checkStagesTableQuery = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_name = 'inspection_stages';
      `;

      const stagesTableResult = await pool.query(checkStagesTableQuery);

      if (stagesTableResult.rows.length === 0) {
        console.log("Warning: inspection_stages table doesn't exist yet. Creating inspection_schedules without stage_id reference.");

        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS inspection_schedules (
            id SERIAL PRIMARY KEY,
            application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
            inspector_id INTEGER NOT NULL REFERENCES inspectors(user_id) ON DELETE CASCADE,
            scheduled_date DATE NOT NULL,
            scheduled_time TIME NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
            notes TEXT,
            created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_application_id ON inspection_schedules(application_id);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_inspector_id ON inspection_schedules(inspector_id);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_status ON inspection_schedules(status);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_scheduled_date ON inspection_schedules(scheduled_date);
        `;

        await pool.query(createTableQuery);
        console.log("Note: You'll need to add stage_id column later after inspection_stages table is created.");
      } else {
        console.log("inspection_stages table exists, creating inspection_schedules with stage_id reference");

        const createTableQuery = `
          CREATE TABLE IF NOT EXISTS inspection_schedules (
            id SERIAL PRIMARY KEY,
            application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
            inspector_id INTEGER NOT NULL REFERENCES inspectors(user_id) ON DELETE CASCADE,
            stage_id INTEGER NOT NULL REFERENCES inspection_stages(id),
            scheduled_date DATE NOT NULL,
            scheduled_time TIME NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
            notes TEXT,
            created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_application_id ON inspection_schedules(application_id);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_inspector_id ON inspection_schedules(inspector_id);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_stage_id ON inspection_schedules(stage_id);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_status ON inspection_schedules(status);
          CREATE INDEX IF NOT EXISTS idx_inspection_schedules_scheduled_date ON inspection_schedules(scheduled_date);
        `;

        console.log("Migration successful: inspection_schedules table created with stage_id");
      }

    } else {
      console.log("Migration skipped: inspection_schedules table already exists");
    }

    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export default createInspectionScheduleTable;
