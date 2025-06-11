import {
  getAllInspectorsService,
  getInspectorByIdService,
  createInspectorService,
  updateInspectorService,
  deleteInspectorService
} from '../models/inspectorModel.js';
import { findAvailableInspectorService } from '../models/inspectionScheduleModel.js';

// Helper function for error responses
const errorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({
      status: statusCode >= 500 ? 'error' : 'fail',
      message
  });
};

export const getAllInspectors = async (req, res) => {
  try {
      // Check if query parameters for finding available inspector are provided
      const { scheduledDate, district, inspectionTypeId } = req.query;

      // If scheduledDate is provided, use the findAvailableInspectorService
      if (scheduledDate) {
          console.log('Finding available inspector with params:', { scheduledDate, district, inspectionTypeId });

          try {
              const inspector = await findAvailableInspectorService(
                  scheduledDate,
                  district,
                  inspectionTypeId ? parseInt(inspectionTypeId) : null
              );

              if (!inspector) {
                  console.log('No available inspectors found for the criteria');

                  // Get the inspection type name for better error message
                  let inspectionTypeName = "the requested type";
                  if (inspectionTypeId) {
                      try {
                          const typeQuery = `SELECT name FROM inspection_types WHERE id = $1`;
                          const typeResult = await pool.query(typeQuery, [inspectionTypeId]);
                          if (typeResult.rows.length > 0) {
                              inspectionTypeName = typeResult.rows[0].name;
                          }
                      } catch (error) {
                          console.error('Error getting inspection type name:', error);
                      }
                  }

                  // Return a specific error message
                  let errorMessage = `No available inspectors found for ${district ? `the ${district} district` : 'your area'}.`;
                  if (inspectionTypeId) {
                      errorMessage = `No available inspectors found for ${inspectionTypeName} inspections in the ${district || 'requested'} district.`;
                  }
                  errorMessage += ' Please contact an administrator to assign an inspector for this district.';

                  return res.status(200).json({
                      status: 'success',
                      message: errorMessage,
                      data: null
                  });
              }

              console.log('Found available inspector:', inspector);
              return res.status(200).json({
                  status: 'success',
                  data: inspector
              });
          } catch (findError) {
              console.error('Error in findAvailableInspectorService:', findError);
              console.error('Error stack:', findError.stack);
              return errorResponse(res, 500, `Error finding available inspector: ${findError.message}`);
          }
      }

      // Otherwise, return all inspectors
      console.log('Fetching all inspectors');
      const inspectors = await getAllInspectorsService();
      console.log(`Found ${inspectors.length} inspectors`);

      res.status(200).json({
          status: 'success',
          results: inspectors.length,
          data: { inspectors }
      });
  } catch (err) {
      console.error('Error in getAllInspectors:', err);
      console.error('Error stack:', err.stack);
      errorResponse(res, 500, err.message);
  }
};

export const getInspector = async (req, res) => {
  try {
      const { id } = req.params;
      const inspector = await getInspectorByIdService(id);

      if (!inspector) {
          return errorResponse(res, 404, 'Inspector not found');
      }

      res.status(200).json({
          status: 'success',
          data: { inspector }
      });
  } catch (err) {
      errorResponse(res, 500, err.message);
  }
};

export const createInspector = async (req, res) => {
  try {
      console.log('Creating inspector with data:', JSON.stringify(req.body, null, 2));

      // Simplified approach - only validate the minimum required fields
      const {
          email,
          password,
          work_id,
          role
      } = req.body;

      // Basic validation
      if (!email) {
          return errorResponse(res, 400, 'Email is required');
      }

      if (!password) {
          return errorResponse(res, 400, 'Password is required');
      }

      if (!work_id) {
          return errorResponse(res, 400, 'Work ID is required');
      }

      // Check if the role is admin or superadmin
      if (role === 'admin' || role === 'superadmin') {
          return errorResponse(res, 400, 'Admin and superadmin users cannot be inspectors');
      }

      // Set default values for optional fields
      const inspectorData = {
          ...req.body,
          first_name: req.body.first_name || 'Default',
          last_name: req.body.last_name || 'Inspector',
          national_id_number: req.body.national_id_number || `ID-${Date.now()}`,
          contact_number: req.body.contact_number || '0000000000',
          physical_address: req.body.physical_address || 'Default Address',
          assigned_district: req.body.assigned_district || 'Harare Central',
          inspection_type: req.body.inspection_type || 'General',
          license_number: req.body.license_number || '',
          available: req.body.available !== undefined ? req.body.available : true
      };

      console.log('Processed inspector data:', JSON.stringify(inspectorData, null, 2));

      const newInspector = await createInspectorService(inspectorData);

      res.status(201).json({
          status: 'success',
          data: { inspector: newInspector }
      });
  } catch (err) {
      errorResponse(res, 400, err.message);
  }
};

export const updateInspector = async (req, res) => {
  try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove password from update if present (should have separate endpoint for password changes)
      if (updateData.password) {
          delete updateData.password;
      }

      const updatedInspector = await updateInspectorService(id, updateData);

      if (!updatedInspector) {
          return errorResponse(res, 404, 'Inspector not found');
      }

      res.status(200).json({
          status: 'success',
          data: { inspector: updatedInspector }
      });
  } catch (err) {
      errorResponse(res, 400, err.message);
  }
};

export const deleteInspector = async (req, res) => {
  try {
      const { id } = req.params;
      const deletedInspector = await deleteInspectorService(id);

      if (!deletedInspector) {
          return errorResponse(res, 404, 'Inspector not found');
      }

      res.status(204).end();
  } catch (err) {
      errorResponse(res, 500, err.message);
  }
};