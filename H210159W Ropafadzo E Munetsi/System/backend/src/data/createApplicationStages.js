// db/createApplicationStages.js
import pool from "../config/db.js";

const createApplicationStagesTable = async () => {
    const queryText = `
    -- Application Stages Table
    CREATE TABLE IF NOT EXISTS application_stages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        order_number INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Application Progress Table (tracks each application's progress through stages)
    CREATE TABLE IF NOT EXISTS application_progress (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        stage_id INTEGER NOT NULL REFERENCES application_stages(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        notes TEXT,
        completed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(application_id, stage_id)
    );

    -- Stage Requirements Table (defines what's needed to complete each stage)
    CREATE TABLE IF NOT EXISTS stage_requirements (
        id SERIAL PRIMARY KEY,
        stage_id INTEGER NOT NULL REFERENCES application_stages(id) ON DELETE CASCADE,
        requirement_type VARCHAR(50) NOT NULL,
        requirement_name VARCHAR(100) NOT NULL,
        is_mandatory BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Requirement Completion Table (tracks completion of requirements for each application)
    CREATE TABLE IF NOT EXISTS requirement_completion (
        id SERIAL PRIMARY KEY,
        application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
        requirement_id INTEGER NOT NULL REFERENCES stage_requirements(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected')),
        completed_at TIMESTAMPTZ,
        verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        notes TEXT,
        reference_id INTEGER,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(application_id, requirement_id)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_application_progress_app_id ON application_progress(application_id);
    CREATE INDEX IF NOT EXISTS idx_application_progress_stage_id ON application_progress(stage_id);
    CREATE INDEX IF NOT EXISTS idx_application_progress_status ON application_progress(status);
    CREATE INDEX IF NOT EXISTS idx_stage_requirements_stage_id ON stage_requirements(stage_id);
    CREATE INDEX IF NOT EXISTS idx_requirement_completion_app_id ON requirement_completion(application_id);
    CREATE INDEX IF NOT EXISTS idx_requirement_completion_req_id ON requirement_completion(requirement_id);
    CREATE INDEX IF NOT EXISTS idx_requirement_completion_status ON requirement_completion(status);
    `;

    try {
        await pool.query(queryText);
        console.log("Application stages tables created successfully");
        
        // Insert default stages if they don't exist
        await insertDefaultStages();
    } catch (error) {
        console.error("Error creating application stages tables:", error);
        throw error;
    }
};

// Insert default application stages
const insertDefaultStages = async () => {
    try {
        // Check if stages already exist
        const checkResult = await pool.query("SELECT COUNT(*) FROM application_stages");
        if (parseInt(checkResult.rows[0].count) > 0) {
            console.log("Application stages already exist, skipping default insertion");
            return;
        }

        // Define the default stages
        const stages = [
            { name: 'Application Submission', description: 'Initial submission of building plan application', order_number: 1 },
            { name: 'Document Verification', description: 'Verification of all required documents', order_number: 2 },
            { name: 'Plan Review', description: 'Technical review of building plans', order_number: 3 },
            { name: 'Initial Payment', description: 'Payment of application fees', order_number: 4 },
            { name: 'Approval', description: 'Approval of building plans', order_number: 5 },
            { name: 'Foundation Inspection', description: 'Inspection of building foundation', order_number: 6 },
            { name: 'Structural Inspection', description: 'Inspection of building structure', order_number: 7 },
            { name: 'Plumbing Inspection', description: 'Inspection of plumbing systems', order_number: 8 },
            { name: 'Electrical Inspection', description: 'Inspection of electrical systems', order_number: 9 },
            { name: 'Final Inspection', description: 'Final inspection of completed building', order_number: 10 },
            { name: 'Certificate of Occupancy', description: 'Issuance of certificate of occupancy', order_number: 11 }
        ];

        // Insert stages
        for (const stage of stages) {
            await pool.query(
                `INSERT INTO application_stages (name, description, order_number) 
                 VALUES ($1, $2, $3)`,
                [stage.name, stage.description, stage.order_number]
            );
        }

        console.log("Default application stages inserted successfully");

        // Insert default requirements for each stage
        await insertDefaultRequirements();
    } catch (error) {
        console.error("Error inserting default application stages:", error);
        throw error;
    }
};

// Insert default requirements for each stage
const insertDefaultRequirements = async () => {
    try {
        // Check if requirements already exist
        const checkResult = await pool.query("SELECT COUNT(*) FROM stage_requirements");
        if (parseInt(checkResult.rows[0].count) > 0) {
            console.log("Stage requirements already exist, skipping default insertion");
            return;
        }

        // Get all stages
        const stagesResult = await pool.query("SELECT id, name FROM application_stages ORDER BY order_number");
        const stages = stagesResult.rows;

        // Define requirements for each stage
        const requirementsByStage = {
            'Application Submission': [
                { type: 'form', name: 'Application Form', description: 'Complete application form with all required fields' },
                { type: 'document', name: 'Property Deed', description: 'Proof of property ownership' },
                { type: 'document', name: 'Site Plan', description: 'Detailed site plan showing property boundaries and building location' }
            ],
            'Document Verification': [
                { type: 'document', name: 'Building Plans', description: 'Architectural drawings of the proposed building' },
                { type: 'document', name: 'Structural Calculations', description: 'Engineering calculations for structural elements' },
                { type: 'document', name: 'Environmental Impact Assessment', description: 'Assessment of environmental impact', is_mandatory: false }
            ],
            'Plan Review': [
                { type: 'approval', name: 'Zoning Compliance', description: 'Verification that plans comply with zoning regulations' },
                { type: 'approval', name: 'Building Code Compliance', description: 'Verification that plans comply with building codes' },
                { type: 'approval', name: 'Fire Safety Compliance', description: 'Verification that plans comply with fire safety regulations' }
            ],
            'Initial Payment': [
                { type: 'payment', name: 'Application Fee', description: 'Payment of application processing fee' },
                { type: 'payment', name: 'Plan Review Fee', description: 'Payment of plan review fee' }
            ],
            'Approval': [
                { type: 'approval', name: 'Final Plan Approval', description: 'Final approval of building plans' },
                { type: 'document', name: 'Building Permit', description: 'Issuance of building permit' }
            ],
            'Foundation Inspection': [
                { type: 'inspection', name: 'Foundation Inspection', description: 'Inspection of building foundation' },
                { type: 'document', name: 'Foundation Inspection Report', description: 'Report of foundation inspection results' }
            ],
            'Structural Inspection': [
                { type: 'inspection', name: 'Structural Inspection', description: 'Inspection of building structure' },
                { type: 'document', name: 'Structural Inspection Report', description: 'Report of structural inspection results' }
            ],
            'Plumbing Inspection': [
                { type: 'inspection', name: 'Plumbing Inspection', description: 'Inspection of plumbing systems' },
                { type: 'document', name: 'Plumbing Inspection Report', description: 'Report of plumbing inspection results' }
            ],
            'Electrical Inspection': [
                { type: 'inspection', name: 'Electrical Inspection', description: 'Inspection of electrical systems' },
                { type: 'document', name: 'Electrical Inspection Report', description: 'Report of electrical inspection results' }
            ],
            'Final Inspection': [
                { type: 'inspection', name: 'Final Inspection', description: 'Final inspection of completed building' },
                { type: 'document', name: 'Final Inspection Report', description: 'Report of final inspection results' },
                { type: 'payment', name: 'Final Fees', description: 'Payment of any remaining fees' }
            ],
            'Certificate of Occupancy': [
                { type: 'approval', name: 'Certificate Approval', description: 'Final approval for certificate of occupancy' },
                { type: 'document', name: 'Certificate of Occupancy', description: 'Issuance of certificate of occupancy' }
            ]
        };

        // Insert requirements for each stage
        for (const stage of stages) {
            const requirements = requirementsByStage[stage.name] || [];
            for (const req of requirements) {
                await pool.query(
                    `INSERT INTO stage_requirements 
                     (stage_id, requirement_type, requirement_name, is_mandatory, description) 
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        stage.id, 
                        req.type, 
                        req.name, 
                        req.hasOwnProperty('is_mandatory') ? req.is_mandatory : true, 
                        req.description
                    ]
                );
            }
        }

        console.log("Default stage requirements inserted successfully");
    } catch (error) {
        console.error("Error inserting default stage requirements:", error);
        throw error;
    }
};

export default createApplicationStagesTable;
