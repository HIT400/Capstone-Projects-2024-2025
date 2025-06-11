import {
  getAllPaymentSettingsService,
  getPaymentSettingByTypeService,
  createPaymentSettingService,
  updatePaymentSettingService,
  deletePaymentSettingService
} from "../models/paymentSettingsModel.js";
import { ErrorResponse } from "../utils/errorResponse.js";

/**
 * Helper function to handle API responses
 */
const handleResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data
  });
};

/**
 * Get all payment settings
 * @route GET /api/payment-settings
 * @access Private (Admin)
 */
export const getAllPaymentSettings = async (req, res, next) => {
  try {
    const paymentSettings = await getAllPaymentSettingsService();
    handleResponse(res, 200, "Payment settings retrieved successfully", paymentSettings);
  } catch (err) {
    next(err);
  }
};

/**
 * Get payment setting by type
 * @route GET /api/payment-settings/:type
 * @access Private
 */
export const getPaymentSettingByType = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    if (!type) {
      return next(new ErrorResponse("Payment type is required", 400));
    }
    
    const paymentSetting = await getPaymentSettingByTypeService(type);
    
    if (!paymentSetting) {
      return next(new ErrorResponse(`Payment setting with type ${type} not found`, 404));
    }
    
    handleResponse(res, 200, "Payment setting retrieved successfully", paymentSetting);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new payment setting
 * @route POST /api/payment-settings
 * @access Private (Admin)
 */
export const createPaymentSetting = async (req, res, next) => {
  try {
    const { paymentType, amount, description } = req.body;
    
    // Validate required fields
    if (!paymentType || !amount) {
      return next(new ErrorResponse("Payment type and amount are required", 400));
    }
    
    // Check if payment type already exists
    const existingSetting = await getPaymentSettingByTypeService(paymentType);
    if (existingSetting) {
      return next(new ErrorResponse(`Payment setting with type ${paymentType} already exists`, 400));
    }
    
    // Create the payment setting
    const paymentSetting = await createPaymentSettingService({
      paymentType,
      amount,
      description,
      createdBy: req.user.id
    });
    
    handleResponse(res, 201, "Payment setting created successfully", paymentSetting);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a payment setting
 * @route PUT /api/payment-settings/:id
 * @access Private (Admin)
 */
export const updatePaymentSetting = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, description, isActive } = req.body;
    
    // Validate required fields
    if (!amount) {
      return next(new ErrorResponse("Amount is required", 400));
    }
    
    // Update the payment setting
    const paymentSetting = await updatePaymentSettingService(id, {
      amount,
      description,
      isActive: isActive !== undefined ? isActive : true,
      updatedBy: req.user.id
    });
    
    if (!paymentSetting) {
      return next(new ErrorResponse(`Payment setting with ID ${id} not found`, 404));
    }
    
    handleResponse(res, 200, "Payment setting updated successfully", paymentSetting);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a payment setting
 * @route DELETE /api/payment-settings/:id
 * @access Private (Admin)
 */
export const deletePaymentSetting = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const paymentSetting = await deletePaymentSettingService(id);
    
    if (!paymentSetting) {
      return next(new ErrorResponse(`Payment setting with ID ${id} not found`, 404));
    }
    
    handleResponse(res, 200, "Payment setting deleted successfully", paymentSetting);
  } catch (err) {
    next(err);
  }
};
