// import pool from "../config/db.js";

// const createInspectorTable = async () => {
//   const queryText = `
//     CREATE TABLE IF NOT EXISTS inspectors (
//       id SERIAL PRIMARY KEY,
//       first_name VARCHAR(100) NOT NULL,
//       last_name VARCHAR(100) NOT NULL,
//       email VARCHAR(100) UNIQUE NOT NULL,
//       password VARCHAR(100) UNIQUE NOT NULL,
//       contact VARCHAR(20) NOT NULL,
//       work_id VARCHAR(50) UNIQUE NOT NULL,
//       license_number VARCHAR(50) UNIQUE,
//       specialization VARCHAR(100),
//       available BOOLEAN NOT NULL DEFAULT TRUE,
//       assigned_district VARCHAR(100) NOT NULL,
//       inspection_type VARCHAR(100) NOT NULL,
//       created_at TIMESTAMPTZ DEFAULT NOW(),
//       updated_at TIMESTAMPTZ DEFAULT NOW()
//     );

//   `;

//   try {
//     await pool.query(queryText);
//     console.log("✅ Inspector table created successfully");
//   } catch (error) {
//     console.error("❌ Error creating inspector table:", error);
//     throw error; // Re-throw to handle in calling function
//   }
// };

// export default createInspectorTable;

