/**
 * Utility functions for standardized API responses
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @returns {Object} Response object
 */
export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} errors - Additional error details
 * @returns {Object} Response object
 */
export const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    errors
  });
};
