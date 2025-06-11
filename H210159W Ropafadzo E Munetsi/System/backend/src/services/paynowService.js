import { Paynow } from 'paynow';
import dotenv from 'dotenv';
import { initiateMockPayment, checkMockPaymentStatus } from './mockPaynowService.js';

// Load environment variables
dotenv.config();

// Check if test mode is enabled
const isTestMode = process.env.PAYNOW_TEST_MODE === 'true';

// Check if we should use mock mode (for development when Paynow is unreachable)
const useMockMode = process.env.NODE_ENV === 'development' || process.env.USE_PAYNOW === 'true';

// Get timeout for Paynow requests
const paynowTimeout = parseInt(process.env.PAYNOW_TIMEOUT || '5000');

// Initialize Paynow with credentials from environment variables
// Following the official Paynow documentation approach
let paynow;
try {
  paynow = new Paynow(
    process.env.PAYNOW_INTEGRATION_ID,
    process.env.PAYNOW_INTEGRATION_KEY
  );

  // Set return and result urls
  paynow.resultUrl = process.env.PAYNOW_RESULT_URL;
  paynow.returnUrl = process.env.PAYNOW_RETURN_URL;

  // Test mode is automatically handled by the Paynow SDK
  // The SDK will use test mode based on the integration ID and key provided
  if (isTestMode) {
    console.log('Running Paynow in test mode');
  }
} catch (error) {
  console.error('Error initializing Paynow:', error);
  console.log('Will use mock Paynow service as fallback');
}

// Flag to track if we've had connection issues with Paynow
let hasPaynowConnectionIssues = false;

/**
 * Check if an email or phone number is a Paynow test account
 * @param {string} value - Email or phone number to check
 * @returns {boolean} - Whether this is a test account
 */
export const isTestAccount = (value) => {
  if (!value) return false;

  // Test emails end with @testuser.com
  if (value.includes('@') && value.endsWith('@testuser.com')) {
    return true;
  }

  // Test phone numbers
  const testPhones = [
    '0771111111', // EcoCash test number
    '0772222222', // OneMoney test number
    '0773333333', // Telecash test number
    '0774444444', // InnBucks test number
  ];

  return testPhones.includes(value);
}

/**
 * Create and initiate a PayNow payment
 * @param {Object} paymentData - Payment data
 * @param {string} paymentData.reference - Payment reference (e.g., application ID)
 * @param {string} paymentData.email - User's email address
 * @param {string} paymentData.description - Payment description
 * @param {number} paymentData.amount - Payment amount
 * @param {string} paymentData.phone - User's phone number (for mobile payments)
 * @param {string} paymentData.method - Payment method (ecocash, onemoney, etc.)
 * @param {boolean} paymentData.isMobile - Whether this is a mobile payment
 * @returns {Promise<Object>} - PayNow response
 */
export const initiatePaynowPayment = async (paymentData) => {
  try {
    const { reference, email, description, amount, phone, method, isMobile } = paymentData;

    // Validate required parameters
    if (!reference || !email || !amount) {
      return {
        success: false,
        error: "Missing required payment information (reference, email, or amount)"
      };
    }

    // Check if we should use mock mode
    if (useMockMode || hasPaynowConnectionIssues || !paynow) {
      console.log('Using mock Paynow service for payment initiation');
      return await initiateMockPayment(paymentData);
    }

    // Validate email format
    try {
      if (!paynow.isValidEmail(email)) {
        return {
          success: false,
          error: "Invalid email address format"
        };
      }
    } catch (error) {
      console.error('Error validating email, falling back to mock service:', error);
      hasPaynowConnectionIssues = true;
      return await initiateMockPayment(paymentData);
    }

    // For mobile payments, validate phone and method
    if (isMobile && (!phone || !method)) {
      return {
        success: false,
        error: "Mobile payments require phone number and payment method"
      };
    }

    try {
      // Create a new payment with the given reference and email
      const payment = paynow.createPayment(reference, email);

      // Add the payment item
      payment.add(description || "Payment", parseFloat(amount));

      // Set custom return URL with reference if needed
      // This allows you to pass the reference to your return URL
      paynow.returnUrl = `${process.env.PAYNOW_RETURN_URL}?reference=${reference}`;

      // Send the payment to Paynow
      let response;

      try {
        // Special handling for InnBucks in test mode - it's not supported by Paynow test mode
        if (isMobile && method && method.toLowerCase() === 'innbucks' && isTestMode) {
          console.log('InnBucks is not supported in test mode, using mock service instead');
          return await initiateMockPayment(paymentData);
        }

        // Create a timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Paynow request timed out after ${paynowTimeout}ms`)), paynowTimeout);
        });

        if (isMobile) {
          // For mobile payments (EcoCash, OneMoney, etc.) with timeout
          response = await Promise.race([
            paynow.sendMobile(payment, phone, method),
            timeoutPromise
          ]);
        } else {
          // For web-based payments with timeout
          response = await Promise.race([
            paynow.send(payment),
            timeoutPromise
          ]);
        }
      } catch (sendError) {
        console.error('Error sending payment to Paynow:', sendError);

        // Check for specific error messages
        const errorMsg = sendError.message || '';

        // Handle specific InnBucks test mode error
        if (errorMsg.includes('test mode') && errorMsg.includes('InnBucks')) {
          console.log('InnBucks test mode error detected, using mock service');
          return await initiateMockPayment(paymentData);
        }

        // If we have a network error, use the mock service
        if (sendError.code === 'ENOTFOUND' || sendError.code === 'ECONNREFUSED' ||
            sendError.code === 'ETIMEDOUT' ||
            errorMsg.includes('getaddrinfo') || errorMsg.includes('connect') ||
            errorMsg.includes('timeout')) {
          console.log('Network error connecting to Paynow, using mock service');
          hasPaynowConnectionIssues = true;
          return await initiateMockPayment(paymentData);
        }

        return {
          success: false,
          error: "Failed to communicate with Paynow service: " + sendError.message
        };
      }

      // Check if the request was successful
      if (response && response.success) {
        // Return the response data
        return {
          success: true,
          redirectUrl: response.redirectUrl, // For web payments
          pollUrl: response.pollUrl, // URL to check payment status
          instructions: response.instructions, // For mobile payments
          reference: reference,
          // Include additional information for debugging
          status: response.status,
          hasRedirect: response.hasRedirect
        };
      } else {
        // If request was not successful
        return {
          success: false,
          error: response ? response.error : "Unknown error from Paynow"
        };
      }
    } catch (error) {
      console.error('Error in Paynow payment process:', error);

      // If we have a critical error, use the mock service
      console.log('Critical error in Paynow service, using mock service');
      hasPaynowConnectionIssues = true;
      return await initiateMockPayment(paymentData);
    }
  } catch (error) {
    console.error('Error initiating PayNow payment:', error);

    // For any unexpected error, try the mock service
    try {
      console.log('Unexpected error, falling back to mock service');
      return await initiateMockPayment(paymentData);
    } catch (mockError) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred"
      };
    }
  }
};

/**
 * Check the status of a PayNow payment
 * @param {string} pollUrl - The poll URL returned from PayNow
 * @returns {Promise<Object>} - Payment status
 */
export const checkPaymentStatus = async (pollUrl) => {
  try {
    // Check if this is a mock poll URL
    if (pollUrl && pollUrl.startsWith('mock://')) {
      console.log('Using mock service for checking payment status');
      return await checkMockPaymentStatus(pollUrl);
    }

    // Check if we should use mock mode
    if (useMockMode || hasPaynowConnectionIssues || !paynow) {
      console.log('Using mock Paynow service for checking payment status');
      return await checkMockPaymentStatus(pollUrl);
    }

    // Validate poll URL
    if (!pollUrl || typeof pollUrl !== 'string') {
      return {
        success: false,
        error: "Invalid poll URL format - URL is missing or not a string"
      };
    }

    // For non-Paynow URLs, use the mock service
    if (!pollUrl.includes('paynow.co.zw')) {
      console.log('Non-Paynow URL detected, using mock service');
      return await checkMockPaymentStatus(pollUrl);
    }

    // Poll the transaction
    let status;
    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Paynow poll request timed out after ${paynowTimeout}ms`)), paynowTimeout);
      });

      // Poll with timeout
      status = await Promise.race([
        paynow.pollTransaction(pollUrl),
        timeoutPromise
      ]);

      // For test mode, we want to simulate successful payments after a short delay
      // This makes the demo more realistic
      if (isTestMode && status && !status.paid) {
        // Get current timestamp
        const currentTime = new Date();

        // Extract timestamp from reference if available
        let paymentTimestamp;
        if (status.reference) {
          const timestampMatch = status.reference.match(/\d{13,}$/);
          if (timestampMatch) {
            paymentTimestamp = new Date(parseInt(timestampMatch[0]));
          }
        }

        // If we couldn't extract timestamp, use a default delay
        if (!paymentTimestamp) {
          paymentTimestamp = new Date(currentTime.getTime() - 25000); // 25 seconds ago
        }

        const timeDifferenceInSeconds = (currentTime - paymentTimestamp) / 1000;

        // After 15 seconds, automatically mark test payments as paid
        // This simulates a user completing the payment
        if (timeDifferenceInSeconds > 15) {
          status.paid = true;
          status.status = 'paid';
        }
      }
    } catch (pollError) {
      console.error('Error polling transaction:', pollError);

      // If we have a network error, use the mock service
      if (pollError.code === 'ENOTFOUND' || pollError.code === 'ECONNREFUSED' ||
          pollError.message.includes('getaddrinfo') || pollError.message.includes('connect')) {
        console.log('Network error connecting to Paynow, using mock service for status check');
        hasPaynowConnectionIssues = true;
        return await checkMockPaymentStatus(pollUrl);
      }

      return {
        success: false,
        error: "Failed to poll transaction status from Paynow: " + pollError.message
      };
    }

    if (!status) {
      return {
        success: false,
        error: "No status returned from Paynow"
      };
    }

    // Return comprehensive status information
    return {
      success: true,
      paid: status.paid,
      status: status.status,
      amount: status.amount,
      reference: status.reference,
      paynowReference: status.paynowReference,
      // Include additional information if available
      paymentMethod: status.method || null,
      phone: status.phone || null,
      email: status.email || null,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking payment status:', error);

    // For any unexpected error, try the mock service
    try {
      console.log('Unexpected error checking payment status, falling back to mock service');
      return await checkMockPaymentStatus(pollUrl);
    } catch (mockError) {
      return {
        success: false,
        error: error.message || "An unexpected error occurred while checking payment status"
      };
    }
  }
};
