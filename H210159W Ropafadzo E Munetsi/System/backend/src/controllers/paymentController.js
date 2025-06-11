import {
  getAllPaymentsService,
  getPaymentsByUserService,
  getPaymentsByApplicationService,
  getPaymentByIdService,
  createPaymentService,
  updatePaymentStatusService,
  deletePaymentService,
  getPaymentByPollUrlService,
} from "../models/paymentModel.js";
import { ErrorResponse } from "../utils/errorResponse.js";
import { initiatePaynowPayment, checkPaymentStatus, isTestAccount } from "../services/paynowService.js";
import { updateApplicationStatusService } from "../models/applicationModel.js";
import { moveToNextStageService, getApplicationProgressService } from "../models/applicationStageModel.js";
import { updateAllStagesWithPaymentInfoService } from "../models/inspectionStagesModel.js";
import { getPaymentSettingByTypeService } from "../models/paymentSettingsModel.js";
import pool from "../config/db.js";

// Standardized response function
const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};

// Get all payments (admin only)
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await getAllPaymentsService();
    handleResponse(res, 200, "All payments retrieved successfully", payments);
  } catch (err) {
    next(err);
  }
};

// Get payments for the current user
export const getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { payment_type } = req.query; // Optional filter by payment type

    const payments = await getPaymentsByUserService(userId, payment_type);
    handleResponse(res, 200, "User payments retrieved successfully", payments);
  } catch (err) {
    next(err);
  }
};

// Get payments for a specific application
export const getApplicationPayments = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const payments = await getPaymentsByApplicationService(applicationId);
    handleResponse(res, 200, "Application payments retrieved successfully", payments);
  } catch (err) {
    next(err);
  }
};

// Get a specific payment by ID
export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentByIdService(id);

    if (!payment) {
      return next(new ErrorResponse("Payment not found", 404));
    }

    handleResponse(res, 200, "Payment retrieved successfully", payment);
  } catch (err) {
    next(err);
  }
};

// Create a new payment
export const createPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      applicationId,
      amount: requestedAmount, // Rename to distinguish from the fixed amount
      paymentMethod,
      referenceNumber, // This will be optional now
      notes,
      paymentType = 'plan', // Default to plan approval payment
      stageDescription = null // For stage payments
    } = req.body;

    // Handle file upload for invoice if present
    let invoiceFileName = null;
    let invoiceFileType = null;
    let invoiceFileSize = null;
    let invoiceFileData = null;

    if (req.file) {
      invoiceFileName = req.file.originalname;
      invoiceFileType = req.file.mimetype;
      invoiceFileSize = req.file.size;
      invoiceFileData = req.file.buffer;
    }

    // Validate required fields
    if (!applicationId || !paymentMethod) {
      return next(new ErrorResponse("Missing required payment information", 400));
    }

    // Get the fixed amount from payment settings
    const settingType = paymentType === 'plan' ? 'plan_approval' : 'stage_payments';
    const paymentSetting = await getPaymentSettingByTypeService(settingType);

    if (!paymentSetting) {
      return next(new ErrorResponse(`Payment setting for ${settingType} not found`, 404));
    }

    // Use the fixed amount from settings
    const amount = paymentSetting.amount;

    // For cash payments, require invoice upload
    if (paymentMethod === 'cash' && !req.file) {
      return next(new ErrorResponse("Invoice upload is required for cash payments", 400));
    }

    // For stage payments, require stage description
    if (paymentType === 'stage' && !stageDescription) {
      // Set default stage description for consolidated payments
      stageDescription = "All Inspection Stages";
    }

    // Auto-generate reference number if not provided
    const autoReference = referenceNumber || `${paymentType}-${applicationId}-${Date.now()}`;

    // Create the payment record
    const payment = await createPaymentService({
      applicationId,
      userId,
      amount,
      paymentMethod,
      referenceNumber: autoReference,
      invoiceFileName,
      invoiceFileType,
      invoiceFileSize,
      invoiceFileData,
      notes,
      paymentType,
      stageDescription
    });

    // If this is a stage payment and it's marked as completed, update the application stage
    if (paymentType === 'stage' && payment.payment_status === 'completed') {
      await updateStagePaymentStatus(applicationId, stageDescription, payment.id);
    } else if (paymentType === 'plan' && payment.payment_status === 'completed') {
      // For plan approval payments
      // Use 'in_review' status instead of 'payment_completed' as it's an allowed status
      await updateApplicationStatusService(applicationId, 'in_review');
    }

    handleResponse(res, 201, "Payment created successfully", payment);
  } catch (err) {
    next(err);
  }
};

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const verifiedBy = req.user.id;

    if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return next(new ErrorResponse("Invalid payment status", 400));
    }

    const payment = await updatePaymentStatusService(id, status, verifiedBy);

    if (!payment) {
      return next(new ErrorResponse("Payment not found", 404));
    }

    handleResponse(res, 200, "Payment status updated successfully", payment);
  } catch (err) {
    next(err);
  }
};

// Download payment invoice
export const downloadInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await getPaymentByIdService(id);

    if (!payment) {
      return next(new ErrorResponse("Payment not found", 404));
    }

    if (!payment.invoice_file_data) {
      return next(new ErrorResponse("No invoice file available for this payment", 404));
    }

    res.setHeader('Content-Type', payment.invoice_file_type);
    res.setHeader('Content-Disposition', `attachment; filename="${payment.invoice_file_name}"`);
    res.send(payment.invoice_file_data);
  } catch (err) {
    next(err);
  }
};

// Delete a payment (admin only)
export const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await deletePaymentService(id);

    if (!payment) {
      return next(new ErrorResponse("Payment not found", 404));
    }

    handleResponse(res, 200, "Payment deleted successfully", payment);
  } catch (err) {
    next(err);
  }
};

// Initiate a PayNow payment
export const initiatePaynow = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      applicationId,
      amount: requestedAmount, // Rename to distinguish from the fixed amount
      email,
      phone,
      description,
      paymentType = 'plan', // Default to plan approval payment
      stageDescription = null, // For stage payments
      isMobile = false, // Whether this is a mobile payment
      method = null // Payment method for mobile payments (ecocash, onemoney, etc.)
    } = req.body;

    // Validate required fields
    if (!applicationId || !email) {
      return next(new ErrorResponse("Missing required payment information", 400));
    }

    // For mobile payments, require phone and method
    if (isMobile && (!phone || !method)) {
      return next(new ErrorResponse("Phone number and payment method are required for mobile payments", 400));
    }

    // For stage payments, require stage description
    if (paymentType === 'stage' && !stageDescription) {
      // Set default stage description for consolidated payments
      stageDescription = "All Inspection Stages";
    }

    // Get the fixed amount from payment settings
    const settingType = paymentType === 'plan' ? 'plan_approval' : 'stage_payments';
    const paymentSetting = await getPaymentSettingByTypeService(settingType);

    if (!paymentSetting) {
      return next(new ErrorResponse(`Payment setting for ${settingType} not found`, 404));
    }

    // Use the fixed amount from settings
    const amount = paymentSetting.amount;

    // Special handling for InnBucks in test mode
    if (isMobile && method && method.toLowerCase() === 'innbucks' && process.env.PAYNOW_TEST_MODE === 'true') {
      console.log('Warning: InnBucks payments in test mode will use mock payment service');
    }

    // Generate a unique reference for this payment
    const reference = `${paymentType}-${applicationId}-${Date.now()}`;

    // Create a more detailed description
    const paymentDescription = description ||
      (paymentType === 'plan'
        ? `Plan Approval Payment for Application #${applicationId}`
        : `Inspection Stages Payment for Application #${applicationId}`);

    // Log payment initiation for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Initiating ${isMobile ? 'mobile' : 'web'} payment for ${paymentType} with reference: ${reference}`);
    }

    // Initiate the PayNow payment
    const paymentResponse = await initiatePaynowPayment({
      reference,
      email,
      description: paymentDescription,
      amount,
      phone,
      method,
      isMobile
    });

    if (!paymentResponse.success) {
      // Check if this is a mock payment response
      if (paymentResponse.error && paymentResponse.error.includes('mock')) {
        console.log('Using mock payment service due to error:', paymentResponse.error);
        // Try with mock payment service
        const mockPaymentResponse = await import('../services/mockPaynowService.js')
          .then(module => module.initiateMockPayment(paymentData))
          .catch(err => {
            console.error('Error using mock payment service:', err);
            return { success: false, error: 'Failed to use mock payment service' };
          });

        if (mockPaymentResponse.success) {
          paymentResponse = mockPaymentResponse;
        } else {
          return next(new ErrorResponse(`Failed to initiate payment: ${paymentResponse.error}`, 400));
        }
      } else {
        return next(new ErrorResponse(`Failed to initiate PayNow payment: ${paymentResponse.error}`, 400));
      }
    }

    // Create a payment record in our database
    const payment = await createPaymentService({
      applicationId,
      userId,
      amount,
      paymentMethod: isMobile ? `paynow_${method}` : 'paynow',
      referenceNumber: reference,
      notes: description,
      paymentType,
      stageDescription,
      paynowPollUrl: paymentResponse.pollUrl,
      paynowReference: reference
    });

    // Return the payment information and PayNow response
    handleResponse(res, 201, "PayNow payment initiated successfully", {
      payment,
      paynow: {
        redirectUrl: paymentResponse.redirectUrl,
        pollUrl: paymentResponse.pollUrl,
        instructions: paymentResponse.instructions
      }
    });
  } catch (err) {
    next(err);
  }
};

// Handle PayNow payment update (callback from PayNow)
export const paynowUpdate = async (req, res, next) => {
  try {
    // Parse the response from PayNow
    const { poll_url } = req.body;

    if (!poll_url) {
      return next(new ErrorResponse("Missing poll URL in PayNow update", 400));
    }

    // Get the payment by poll URL
    const payment = await getPaymentByPollUrlService(poll_url);

    if (!payment) {
      return next(new ErrorResponse("Payment not found for the given poll URL", 404));
    }

    // Check the payment status with PayNow
    const statusResponse = await checkPaymentStatus(poll_url);

    if (!statusResponse.success) {
      return next(new ErrorResponse(`Failed to check payment status: ${statusResponse.error}`, 400));
    }

    // Update the payment status in our database
    let status = 'pending';
    if (statusResponse.paid) {
      status = 'completed';
    } else if (statusResponse.status === 'cancelled' || statusResponse.status === 'failed') {
      status = 'failed';
    }

    await updatePaymentStatusService(payment.id, status);

    // If payment is completed, update application status based on payment type
    if (status === 'completed') {
      if (payment.payment_type === 'plan') {
        // For plan approval payments
        // Use 'in_review' status instead of 'payment_completed' as it's an allowed status
        await updateApplicationStatusService(payment.application_id, 'in_review');
      } else if (payment.payment_type === 'stage' && payment.stage_description) {
        // For stage payments
        await updateStagePaymentStatus(payment.application_id, payment.stage_description, payment.id);
      }
    }

    // Return a success response
    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
};

// Check PayNow payment status
export const checkPaynowStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(parseInt(id))) {
      return next(new ErrorResponse("Invalid payment ID format", 400));
    }

    const payment = await getPaymentByIdService(id);

    if (!payment) {
      return next(new ErrorResponse("Payment not found", 404));
    }

    // Validate payment method
    if (!payment.payment_method.includes('paynow')) {
      return next(new ErrorResponse("This payment was not made using Paynow", 400));
    }

    // Validate poll URL
    if (!payment.paynow_poll_url) {
      return next(new ErrorResponse("This payment does not have a Paynow poll URL", 400));
    }

    // Check the payment status with PayNow
    const statusResponse = await checkPaymentStatus(payment.paynow_poll_url);

    if (!statusResponse.success) {
      return next(new ErrorResponse(`Failed to check payment status: ${statusResponse.error}`, 400));
    }

    // Update the payment status in our database if it's completed
    if (statusResponse.paid && payment.payment_status !== 'completed') {
      await updatePaymentStatusService(payment.id, 'completed');

      // If this is a stage payment, update the application stage
      if (payment.payment_type === 'stage' && payment.stage_description) {
        await updateStagePaymentStatus(payment.application_id, payment.stage_description, payment.id);
      } else if (payment.payment_type === 'plan') {
        // For plan approval payments
        // Use 'in_review' status instead of 'payment_completed' as it's an allowed status
        await updateApplicationStatusService(payment.application_id, 'in_review');
      }
    }

    // Return the payment status with detailed information
    handleResponse(res, 200, "Payment status retrieved successfully", {
      payment_id: payment.id,
      status: statusResponse.paid ? 'completed' : payment.payment_status,
      paynow_status: statusResponse.status,
      amount: statusResponse.amount,
      reference: statusResponse.reference,
      paynow_reference: statusResponse.paynowReference,
      payment_method: payment.payment_method,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    });
  } catch (err) {
    console.error('Error in checkPaynowStatus:', err);
    next(err);
  }
};

// Handle PayNow payment update (webhook)
export const handlePaynowUpdate = async (req, res, next) => {
  try {
    console.log('Received Paynow update webhook:', req.body);

    // Extract only the fields we need
    const { reference, status, paynowreference, amount, authemail, phone, method } = req.body;

    if (!reference || !status) {
      console.error('Missing required payment update information:', req.body);
      return next(new ErrorResponse("Missing required payment update information", 400));
    }

    // Find the payment by reference
    // We need to find the payment by reference number
    const payment = await pool.query(
      "SELECT * FROM payments WHERE reference_number = $1",
      [reference]
    ).then(result => result.rows[0]);

    if (!payment) {
      console.error(`Payment with reference ${reference} not found`);
      return next(new ErrorResponse("Payment not found", 404));
    }

    // Update the payment status based on Paynow status
    let newStatus;
    if (status === 'paid' || status === 'awaiting delivery') {
      newStatus = 'completed';
    } else if (status === 'cancelled' || status === 'failed') {
      newStatus = 'failed';
    } else if (status === 'created' || status === 'sent') {
      newStatus = 'pending';
    } else {
      newStatus = 'unknown';
    }

    // For test payments, we want to ensure they're properly recorded
    // This helps with demonstration purposes

    // Update payment record with all available information
    // Build the SET clause and values for the update query
    const updateFields = [];
    const updateValues = [];
    let paramIndex = 1;

    // Add fields to update
    updateFields.push(`payment_status = $${paramIndex++}`);
    updateValues.push(newStatus);

    if (status) {
      updateFields.push(`paynow_status = $${paramIndex++}`);
      updateValues.push(status);
    }

    if (paynowreference) {
      updateFields.push(`paynow_reference = $${paramIndex++}`);
      updateValues.push(paynowreference);
    }

    if (amount) {
      updateFields.push(`amount = $${paramIndex++}`);
      updateValues.push(amount);
    }

    if (method) {
      updateFields.push(`payment_method = $${paramIndex++}`);
      updateValues.push(method);
    }

    if (phone) {
      updateFields.push(`phone = $${paramIndex++}`);
      updateValues.push(phone);
    }

    if (authemail) {
      updateFields.push(`email = $${paramIndex++}`);
      updateValues.push(authemail);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    // Add the WHERE clause
    updateValues.push(payment.id);

    // Execute the update query
    await pool.query(
      `UPDATE payments SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
      updateValues
    );

    // If payment is completed, update application status if needed
    if (newStatus === 'completed') {
      // For plan approval payments
      if (payment.payment_type === 'plan') {
        // Update application status to indicate payment is complete
        // Use 'in_review' status instead of 'payment_completed' as it's an allowed status
        await updateApplicationStatusService(payment.application_id, 'in_review');
      }

      // For stage payments
      if (payment.payment_type === 'stage') {
        // Update application stage status to indicate payment is complete
        await updateStagePaymentStatus(payment.application_id, payment.stage_description, payment.id);
      }
    }

    // Return a success response
    handleResponse(res, 200, "Payment status updated successfully", {
      payment_id: payment.id,
      reference: reference,
      status: newStatus,
      paynow_status: status
    });
  } catch (err) {
    console.error('Error handling Paynow update:', err);
    // Always return 200 to Paynow even if there's an error
    // This prevents Paynow from retrying the webhook unnecessarily
    handleResponse(res, 200, "Received payment update");
  }
};

// Helper function to update application stage status when a stage payment is completed
const updateStagePaymentStatus = async (applicationId, stageDescription, paymentId) => {
  try {
    console.log(`Updating stage status for application ${applicationId}, stage: ${stageDescription}, payment: ${paymentId}`);

    // Get the current application progress
    const progress = await getApplicationProgressService(applicationId);

    if (!progress || progress.length === 0) {
      console.error(`No progress found for application ${applicationId}`);
      return;
    }

    // Check if this is a consolidated payment for all inspection stages
    if (stageDescription && stageDescription.toLowerCase().includes('all inspection stages')) {
      console.log(`Processing consolidated payment for all inspection stages for application ${applicationId}`);

      // Get payment details to update inspection stages
      const paymentDetails = await getPaymentByIdService(paymentId);

      if (paymentDetails) {
        // Update all inspection stages with payment information
        await updateAllStagesWithPaymentInfoService(
          applicationId,
          paymentDetails.amount,
          paymentDetails.reference_number
        );

        console.log(`Successfully updated all inspection stages with payment information for application ${applicationId}`);
      }

      // Move to the inspection scheduling stage
      await moveToNextStageService(
        applicationId,
        null, // completedBy - could be set to an admin user if needed
        `All inspection stages payment completed. Payment ID: ${paymentId}`
      );

      console.log(`Successfully moved application ${applicationId} to the inspection scheduling stage`);
      return;
    }

    // For individual stage payments (legacy support)
    // Find the stage that matches the description (or closest match)
    let matchingStage = null;

    // First try exact match
    matchingStage = progress.find(stage =>
      stage.stage_name.toLowerCase() === stageDescription.toLowerCase()
    );

    // If no exact match, try to find a stage that contains the description
    if (!matchingStage) {
      matchingStage = progress.find(stage =>
        stage.stage_name.toLowerCase().includes(stageDescription.toLowerCase()) ||
        stageDescription.toLowerCase().includes(stage.stage_name.toLowerCase())
      );
    }

    // If still no match, use the current stage
    if (!matchingStage) {
      const currentStage = progress.find(stage => stage.progress_status === 'in_progress');
      if (currentStage) {
        matchingStage = currentStage;
      } else {
        // If no in-progress stage, find the first pending stage
        matchingStage = progress.find(stage => stage.progress_status === 'pending');
      }
    }

    if (!matchingStage) {
      console.error(`Could not find a matching stage for description: ${stageDescription}`);
      return;
    }

    console.log(`Found matching stage: ${matchingStage.stage_name} (ID: ${matchingStage.stage_id})`);

    // Move to the next stage
    await moveToNextStageService(
      applicationId,
      null, // completedBy - could be set to an admin user if needed
      `Stage payment completed. Payment ID: ${paymentId}`
    );

    console.log(`Successfully moved application ${applicationId} to the next stage`);
  } catch (error) {
    console.error('Error updating stage payment status:', error);
  }
};