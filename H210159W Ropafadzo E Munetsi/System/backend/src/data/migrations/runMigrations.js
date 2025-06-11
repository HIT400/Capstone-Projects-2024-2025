import addExtractionMetadataColumn from './addExtractionMetadata.js';
import createPaymentsTable from './createPaymentsTable.js';
import updateUserRoleConstraint from './updateUserRoleConstraint.js';
import createInspectionScheduleTable from './createInspectionScheduleTable.js';
import { createInspectionStagesTable } from './create_inspection_stages_table.js';
import createInspectionTypesTable from './createInspectionTypesTable.js';
import addInspectionTypeToStages from './addInspectionTypeToStages.js';
import updatePaymentsTableForPaynow from './updatePaymentsTableForPaynow.js';
import updatePaymentsTableForWebhook from './updatePaymentsTableForWebhook.js';
import createPaymentSettingsTable from './createPaymentSettingsTable.js';

/**
 * Run all database migrations in sequence
 */
const runMigrations = async () => {
  try {
    console.log("Starting database migrations...");

    // Add migrations in order
    await addExtractionMetadataColumn();
    await createPaymentsTable();
    await updateUserRoleConstraint();
    await createInspectionScheduleTable();
    await createInspectionStagesTable();
    await createInspectionTypesTable();
    await addInspectionTypeToStages();
    await updatePaymentsTableForPaynow();
    await updatePaymentsTableForWebhook();
    await createPaymentSettingsTable();

    console.log("All migrations completed successfully");
    return true;
  } catch (error) {
    console.error("Migration process failed:", error);
    throw error;
  }
};

export default runMigrations;
