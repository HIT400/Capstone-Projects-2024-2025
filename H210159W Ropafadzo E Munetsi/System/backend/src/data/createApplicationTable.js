import pool from "../config/db.js";

const createApplicationTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_stage_id INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'submitted', 'in_review', 'approved', 'rejected', 'completed')),
    stand_number VARCHAR(100) NOT NULL,
    postal_address VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    construction_type VARCHAR(100) NOT NULL,
    project_description TEXT NOT NULL,
    start_date DATE NOT NULL,
    completion_date DATE NOT NULL,
    architect VARCHAR(100) NOT NULL,
    owner_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    contact_number VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
)
    `;

    try {
      pool.query(queryText);
      console.log("Applications table created if not exists");
    } catch (error) {
      console.log("Error creating applications table:", error)
    }
};

export default createApplicationTable;