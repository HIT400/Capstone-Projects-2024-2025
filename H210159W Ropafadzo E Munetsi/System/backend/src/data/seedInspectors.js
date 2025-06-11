import pool from "../config/db.js";
import bcrypt from 'bcryptjs';

/**
 * Seed the database with test inspectors
 */
const seedInspectors = async () => {
  const client = await pool.connect();
  try {
    console.log("Starting to seed inspectors...");
    
    // Check if we already have inspectors
    const checkQuery = `SELECT COUNT(*) FROM inspectors`;
    const checkResult = await client.query(checkQuery);
    const inspectorCount = parseInt(checkResult.rows[0].count);
    
    if (inspectorCount > 0) {
      console.log(`Database already has ${inspectorCount} inspectors. Skipping seed.`);
      return;
    }
    
    await client.query('BEGIN');
    
    // Create test inspectors with different specializations and districts
    const inspectors = [
      {
        email: 'inspector1@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        contact_number: '1234567890',
        physical_address: '123 Main St, Harare',
        national_id_number: 'ID12345678',
        work_id: 'INSP001',
        specialization: 'Structural',
        assigned_district: 'Harare Central',
        inspection_type: 'Foundation'
      },
      {
        email: 'inspector2@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Smith',
        contact_number: '2345678901',
        physical_address: '456 Oak St, Harare',
        national_id_number: 'ID23456789',
        work_id: 'INSP002',
        specialization: 'Electrical',
        assigned_district: 'Harare South',
        inspection_type: 'Electrical'
      },
      {
        email: 'inspector3@example.com',
        password: 'password123',
        first_name: 'Robert',
        last_name: 'Johnson',
        contact_number: '3456789012',
        physical_address: '789 Pine St, Harare',
        national_id_number: 'ID34567890',
        work_id: 'INSP003',
        specialization: 'Plumbing',
        assigned_district: 'Harare North',
        inspection_type: 'Plumbing'
      },
      {
        email: 'inspector4@example.com',
        password: 'password123',
        first_name: 'Mary',
        last_name: 'Williams',
        contact_number: '4567890123',
        physical_address: '101 Elm St, Harare',
        national_id_number: 'ID45678901',
        work_id: 'INSP004',
        specialization: 'General',
        assigned_district: 'Harare East',
        inspection_type: 'General'
      },
      {
        email: 'inspector5@example.com',
        password: 'password123',
        first_name: 'David',
        last_name: 'Brown',
        contact_number: '5678901234',
        physical_address: '202 Cedar St, Harare',
        national_id_number: 'ID56789012',
        work_id: 'INSP005',
        specialization: 'Structural',
        assigned_district: 'Harare West',
        inspection_type: 'Structural'
      }
    ];
    
    // Insert each inspector
    for (const inspector of inspectors) {
      // Hash the password
      const salt = 10;
      const hashedPassword = await bcrypt.hash(inspector.password, salt);
      
      // First create the user
      const userQuery = `
        INSERT INTO users (
          email, password_hash, role, first_name, last_name,
          contact_number, physical_address, national_id_number
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;
      
      const userValues = [
        inspector.email,
        hashedPassword,
        'inspector',
        inspector.first_name,
        inspector.last_name,
        inspector.contact_number,
        inspector.physical_address,
        inspector.national_id_number
      ];
      
      const userResult = await client.query(userQuery, userValues);
      const userId = userResult.rows[0].id;
      
      // Then create the inspector
      const inspectorQuery = `
        INSERT INTO inspectors (
          user_id, work_id, license_number, specialization,
          available, assigned_district, inspection_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      
      const inspectorValues = [
        userId,
        inspector.work_id,
        inspector.work_id, // Using work_id as license_number for simplicity
        inspector.specialization,
        true, // available
        inspector.assigned_district,
        inspector.inspection_type
      ];
      
      await client.query(inspectorQuery, inspectorValues);
      console.log(`Created inspector: ${inspector.first_name} ${inspector.last_name}`);
    }
    
    await client.query('COMMIT');
    console.log("Successfully seeded inspectors");
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error seeding inspectors:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Run this function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  try {
    await seedInspectors();
    console.log('Inspector seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

export default seedInspectors;
