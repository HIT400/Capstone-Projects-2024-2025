/**
 * Mock Paynow Service for development and testing
 * This service simulates Paynow functionality when the real service is unavailable
 */

// Simulate a delay for async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Create and initiate a mock PayNow payment
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Mock PayNow response
 */
export const initiateMockPayment = async (paymentData) => {
  // Simulate network delay
  await delay(1000);

  const { reference, email, description, amount, phone, method, isMobile } = paymentData;

  // Validate required parameters
  if (!reference || !email || !amount) {
    return {
      success: false,
      error: "Missing required payment information (reference, email, or amount)"
    };
  }

  // For mobile payments, validate phone and method
  if (isMobile && (!phone || !method)) {
    return {
      success: false,
      error: "Mobile payments require phone number and payment method"
    };
  }

  // Generate a mock poll URL with the reference and additional info
  const pollUrl = `mock://payments/poll/${reference}?amount=${amount}&method=${method || 'web'}`;

  // Create payment method specific instructions
  let instructions = "This is a mock payment. In a real environment, you would be redirected to the payment gateway.";

  if (isMobile) {
    // Create method-specific instructions
    switch(method.toLowerCase()) {
      case 'ecocash':
        instructions = `This is a mock EcoCash payment. In a real environment, you would receive a prompt on your EcoCash wallet (${phone}).`;
        break;
      case 'onemoney':
        instructions = `This is a mock OneMoney payment. In a real environment, you would receive a prompt on your OneMoney wallet (${phone}).`;
        break;
      case 'telecash':
        instructions = `This is a mock Telecash payment. In a real environment, you would receive a prompt on your Telecash wallet (${phone}).`;
        break;
      case 'innbucks':
        instructions = `This is a mock InnBucks payment. In a real environment, you would receive a prompt on your InnBucks wallet (${phone}).`;
        break;
      default:
        instructions = `This is a mock mobile payment. In a real environment, you would receive a prompt on your phone (${phone}).`;
    }
  }

  // Create a mock response
  return {
    success: true,
    redirectUrl: `mock://payments/redirect/${reference}`,
    pollUrl: pollUrl,
    instructions: instructions,
    reference: reference,
    status: "created",
    hasRedirect: !isMobile
  };
};

/**
 * Check the status of a mock payment
 * @param {string} pollUrl - The mock poll URL
 * @returns {Promise<Object>} - Mock payment status
 */
export const checkMockPaymentStatus = async (pollUrl) => {
  // Simulate network delay
  await delay(1000);

  // Extract reference from poll URL
  const reference = pollUrl.split('/').pop();

  // Extract timestamp from reference if available
  let paymentTimestamp;
  const timestampMatch = reference.match(/\d{13,}$/);
  if (timestampMatch) {
    paymentTimestamp = new Date(parseInt(timestampMatch[0]));
  } else {
    paymentTimestamp = new Date(Date.now() - 30000); // 30 seconds ago
  }

  // Calculate time difference
  const timeDifferenceInSeconds = (new Date() - paymentTimestamp) / 1000;

  // After 10 seconds, automatically mark mock payments as paid
  const isPaid = timeDifferenceInSeconds > 10;

  return {
    success: true,
    paid: isPaid,
    status: isPaid ? 'paid' : 'awaiting_payment',
    amount: pollUrl.includes('amount=') ?
      parseFloat(pollUrl.split('amount=')[1].split('&')[0]) :
      100.00,
    reference: reference,
    paynowReference: `MOCK-${Date.now()}`,
    paymentMethod: pollUrl.includes('method=') ?
      pollUrl.split('method=')[1].split('&')[0] :
      'mock_payment',
    phone: null,
    email: null,
    timestamp: new Date().toISOString()
  };
};

/**
 * Check if an email or phone number is a test account
 * @param {string} value - Email or phone number to check
 * @returns {boolean} - Whether this is a test account
 */
export const isMockTestAccount = (value) => {
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
};
