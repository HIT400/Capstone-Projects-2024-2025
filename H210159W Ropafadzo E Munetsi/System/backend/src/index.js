import express from "express"
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import pool from "./config/db.js";
import bodyParser from 'body-parser';

import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import applicationStageRoutes from "./routes/applicationStageRoutes.js";
import createApplicationTable from "./data/createApplicationTable.js";
import createApplicationStagesTable from "./data/createApplicationStages.js";
import createUsers, { createAdminUsers } from "./data/createUsers.js";
import documentRoutes from "./routes/documentRoutes.js"
import errorHandler from "./middlewares/errorMiddleware.js";
import inspectorRoutes from "./routes/inspectorRoutes.js"
import inspectionScheduleRoutes from "./routes/inspectionScheduleRoutes.js";
import inspectionStagesRoutes from "./routes/inspectionStagesRoutes.js";
import inspectionTypeRoutes from "./routes/inspectionTypeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import paymentSettingsRoutes from "./routes/paymentSettingsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import districtRoutes from "./routes/districtRoutes.js";
// import bcrypt from "bcryptjs";
import createDocumentsTable from "./data/createDocuments.js";
import runMigrations from "./data/migrations/runMigrations.js";
import seedInspectors from "./data/seedInspectors.js";
import createDistrictsTable from "./data/migrations/create_districts_table.js";
import removeSpecializationAndUpdateTypes from "./data/migrations/removeSpecializationAndUpdateTypes.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

//Middleware
app.use(express.json());
app.use(cors()); // Only call this once
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Routes
app.use('/api/auth', authRoutes);
app.use('/api/inspectors', inspectorRoutes);
app.use('/api/applications', applicationRoutes); // More specific path
app.use('/api/application-stages', applicationStageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use('/api/inspection-schedules', inspectionScheduleRoutes);
app.use('/api/inspection-stages', inspectionStagesRoutes);
app.use('/api/inspection-types', inspectionTypeRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/ai', aiRoutes); // AI testing routes


// Error handling middleware
app.use(errorHandler);



//Create tables and initialize data before starting server
async function initializeDatabase() {
    try {
        // Create tables
        await createUsers();
        await createApplicationTable();
        await createDocumentsTable();
        await createApplicationStagesTable();

        // Import and run the inspection stages table migration
        const { createInspectionStagesTable } = await import('./data/migrations/create_inspection_stages_table.js');
        await createInspectionStagesTable();

        // Create districts table
        await createDistrictsTable();

        // Remove specialization and update inspection types
        await removeSpecializationAndUpdateTypes();

        // Create admin users (both admin and superadmin)
        await createAdminUsers();

        // Run database migrations
        await runMigrations();

        // Seed inspectors if needed
        await seedInspectors();

        console.log('Database initialization, migrations, and seeding completed');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Initialize the database
initializeDatabase();


//testing db connection
app.get("/", async (req, res) => {
const result = await pool.query("SELECT current_database()");
res.send(`the database name is : ${result.rows[0].current_database}`)
});


//server running
app.listen(port, () => {
    console.log(`Server is running at port http:locahost:${port}`);
});
