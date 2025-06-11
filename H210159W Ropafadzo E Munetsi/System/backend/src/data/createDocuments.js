import pool from "../config/db.js";

const createDocumentsTable = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS document_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES document_categories(id) ON DELETE SET NULL,
        application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_type VARCHAR(50) NOT NULL,
        file_size INTEGER NOT NULL,
        file_data BYTEA NOT NULL,
        extracted_text TEXT,
        extraction_metadata JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'under_review')),
        rejection_reason TEXT,
        compliance_result JSONB,
        verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS document_reviews (
        id SERIAL PRIMARY KEY,
        document_id INTEGER NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comments TEXT NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('approved', 'rejected', 'needs_revision')),
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_documents_application_id ON documents(application_id);
    CREATE INDEX IF NOT EXISTS idx_documents_category_id ON documents(category_id);
    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON document_reviews(document_id);
    `;

    try {
        await pool.query(queryText);
        console.log("Documents tables (document_categories, documents, document_reviews) created successfully");
    } catch (error) {
        console.error("Error creating documents tables:", error);
        throw error;
    }
};

export default createDocumentsTable;