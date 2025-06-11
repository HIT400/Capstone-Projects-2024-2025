import pool from '../config/db.js';

/**
 * Script to check if there are any documents in the database
 * and display their details
 */
async function checkDocuments() {
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
    
    console.log('Documents table exists');
    
    // Count documents
    const countQuery = await client.query('SELECT COUNT(*) FROM documents');
    const documentCount = parseInt(countQuery.rows[0].count);
    
    console.log(`Total documents in database: ${documentCount}`);
    
    if (documentCount === 0) {
      console.log('No documents found in the database.');
      return;
    }
    
    // Get all documents
    const documentsQuery = await client.query(`
      SELECT d.id, d.file_name, d.status, d.created_at, 
             d.user_id, u.email as user_email, u.role as user_role
      FROM documents d
      LEFT JOIN users u ON d.user_id = u.id
      ORDER BY d.created_at DESC
    `);
    
    console.log('\nDocuments in database:');
    documentsQuery.rows.forEach((doc, index) => {
      console.log(`\nDocument ${index + 1}:`);
      console.log(`- ID: ${doc.id}`);
      console.log(`- File name: ${doc.file_name}`);
      console.log(`- Status: ${doc.status}`);
      console.log(`- Created at: ${doc.created_at}`);
      console.log(`- User ID: ${doc.user_id}`);
      console.log(`- User email: ${doc.user_email}`);
      console.log(`- User role: ${doc.user_role}`);
    });
    
  } catch (error) {
    console.error('Error checking documents:', error);
  } finally {
    client.release();
  }
}

// Run the function
checkDocuments()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  });
