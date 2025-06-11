import pool from '../config/db.js';

/**
 * Script to add a test document to the database
 * This can be used to verify that the documents table is working correctly
 */
async function addTestDocument() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Check if documents table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Documents table does not exist!');
      return;
    }
    
    console.log('Documents table exists, checking structure...');
    
    // Check table structure
    const columnsQuery = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'documents';
    `);
    
    console.log('Table structure:');
    columnsQuery.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });
    
    // Get a valid user ID from the users table
    const userQuery = await client.query(`
      SELECT id FROM users LIMIT 1;
    `);
    
    if (userQuery.rows.length === 0) {
      console.error('No users found in the database!');
      return;
    }
    
    const userId = userQuery.rows[0].id;
    console.log(`Using user ID: ${userId}`);
    
    // Insert a test document
    const insertResult = await client.query(`
      INSERT INTO documents (
        user_id, file_name, file_type, file_size, 
        status, extracted_text, created_at, updated_at
      ) VALUES (
        $1, 'test_document.pdf', 'application/pdf', 1024,
        'pending', 'This is a test document for testing the admin documents page.', 
        NOW(), NOW()
      ) RETURNING id;
    `, [userId]);
    
    const documentId = insertResult.rows[0].id;
    console.log(`Test document created with ID: ${documentId}`);
    
    // Verify document was created
    const verifyQuery = await client.query(`
      SELECT * FROM documents WHERE id = $1;
    `, [documentId]);
    
    console.log('Test document details:');
    console.log(verifyQuery.rows[0]);
    
    console.log('Test document added successfully!');
  } catch (error) {
    console.error('Error adding test document:', error);
  } finally {
    client.release();
  }
}

// Run the function
addTestDocument()
  .then(() => {
    console.log('Script completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
