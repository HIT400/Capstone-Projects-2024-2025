import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

// Define a generic API response type
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
  results?: number;
}

/**
 * Creates an authenticated API request
 * This function ensures that the token is properly included in all API requests
 */
export const apiRequest = async <T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  customConfig?: AxiosRequestConfig
): Promise<AxiosResponse<ApiResponse<T>>> => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  // Log token for debugging
  console.log(`API Request to ${endpoint}`, {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 10)}...` : 'none'
  });

  // Create request config
  const config: AxiosRequestConfig = {
    method,
    url: `${API_BASE_URL}/${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...customConfig?.headers
    },
    ...customConfig
  };

  // Add data to request if provided
  if (data) {
    if (method === 'GET') {
      config.params = data;
    } else {
      config.data = data;
    }
  }

  try {
    // Make the request with timeout
    const response = await axios({
      ...config,
      timeout: 10000 // 10 second timeout
    });
    return response;
  } catch (error: any) {
    // Helper function to create endpoint-specific mock data
    const createEndpointSpecificMockData = () => {
      // For inspection stages, we no longer use mock data
      if (endpoint.includes('inspection-stages')) {
        console.log('No longer using mock data for inspection stages');
        return []; // Return empty array instead of mock data
      }

      // For inspection schedules, we no longer use mock data
      if (endpoint.includes('inspection-schedules')) {
        console.log('No longer using mock data for inspection schedules');
        return []; // Return empty array instead of mock data
      }

      // Default to empty array for other endpoints
      return [];
    };

    // Helper function to create mock responses
    const createMockResponse = (reason: string): AxiosResponse<ApiResponse<T>> => {
      // Get endpoint-specific mock data if available
      let mockData = [];

      // We no longer use mock data for inspection endpoints
      if ((endpoint.includes('documents') || (endpoint.includes('applications') && method === 'GET'))
          && !endpoint.includes('inspection')) {
        mockData = createEndpointSpecificMockData();
        console.log(`Generated mock data for ${endpoint}:`, JSON.stringify(mockData, null, 2));
      }

      return {
        status: 200,
        statusText: `OK (Mocked)`,
        data: {
          status: 'success',
          data: mockData,
          message: `Mocked response due to ${reason}`
        },
        headers: {},
        config: config
      } as AxiosResponse<ApiResponse<T>>;
    };

    // Check if endpoint is non-critical and can return mock data
    // We no longer consider inspection endpoints as non-critical
    const isNonCriticalEndpoint =
      endpoint.includes('documents') ||
      (endpoint.includes('applications') && method === 'GET' && !endpoint.includes('inspection'));



    // Enhanced error logging with safe access and handling of circular references
    try {
      // Create a safe copy of the error object with only the properties we need
      const safeErrorObject: {
        status: any;
        statusText: any;
        message: any;
        errorType: any;
        endpoint: string;
        method: string;
        data?: any;
      } = {
        status: error?.response?.status || 'No status',
        statusText: error?.response?.statusText || 'No status text',
        message: error?.message || 'No error message',
        errorType: error?.constructor?.name || typeof error,
        endpoint: endpoint,
        method: config?.method || 'No method'
      };

      // Safely extract response data if it exists
      if (error?.response?.data) {
        try {
          // If data is an object, extract only primitive values to avoid circular references
          if (typeof error.response.data === 'object' && error.response.data !== null) {
            safeErrorObject.data = {};
            // Only include primitive values and simple arrays
            Object.keys(error.response.data).forEach(key => {
              const value = error.response.data[key];
              if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean' ||
                value === null
              ) {
                safeErrorObject.data[key] = value;
              } else if (Array.isArray(value) && value.length < 10) {
                // Include small arrays but limit their size
                safeErrorObject.data[key] = `Array(${value.length})`;
              } else {
                // For complex objects, just note their type
                safeErrorObject.data[key] = `[${typeof value}]`;
              }
            });
          } else {
            // If data is a primitive value, include it directly
            safeErrorObject.data = error.response.data;
          }
        } catch (dataError) {
          safeErrorObject.data = 'Error extracting response data';
        }
      } else {
        safeErrorObject.data = 'No data';
      }

      // Check if safeErrorObject is empty (has no meaningful properties)
      const isEmpty = !safeErrorObject ||
        (Object.keys(safeErrorObject).length === 0) ||
        (Object.keys(safeErrorObject).every(key =>
          safeErrorObject[key] === undefined ||
          safeErrorObject[key] === null ||
          safeErrorObject[key] === 'No status' ||
          safeErrorObject[key] === 'No status text' ||
          safeErrorObject[key] === 'No error message' ||
          safeErrorObject[key] === 'No data'
        ));

      if (isEmpty) {
        console.error(`API Error for ${endpoint}: Empty error object`);
      } else {
        console.error(`API Error for ${endpoint}:`, safeErrorObject);
      }
    } catch (loggingError) {
      // Fallback if error logging itself fails
      console.error(`API Error for ${endpoint} (basic logging - error details could not be processed)`, loggingError);
    }

    // Handle authentication errors
    if (error.response?.status === 401) {
      console.error('Authentication error:', error.response?.data ?
        JSON.stringify(error.response.data, null, 2) : 'No data');

      // If token is invalid, clear it
      if (error.response?.data?.message === 'Not authorized, token failed' ||
          error.response?.data?.message === 'Not authorized, no token') {
        // Prevent multiple redirects by checking if we're already on the login page
        const isLoginPage = window.location.pathname.includes('/auth/login');
        if (!isLoginPage) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');

          // Clear cookies
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';

          // Redirect to login page if in browser environment
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
        }
      }
    }

    // Handle server errors (500)
    if (error?.response?.status === 500) {
      try {
        const safeData = error?.response?.data ?
          (typeof error.response.data === 'object' ?
            JSON.stringify(error.response.data, null, 2) :
            String(error.response.data)) :
          'No error data available';

        console.error('Server error:', safeData);
      } catch (logError) {
        console.error('Server error (failed to log details)');
      }

      error.friendlyMessage = 'The server encountered an error. Please try again later or contact support if the issue persists.';

      // We no longer use mock data for inspection endpoints
      // Only use mock data for truly non-critical endpoints
      const isNonCriticalEndpoint =
        endpoint.includes('documents') ||
        (endpoint.includes('applications') && method === 'GET' && !endpoint.includes('inspection'));

      if (isNonCriticalEndpoint) {
        try {
          console.warn(`Returning mock data for ${endpoint} due to server error`);
          console.warn('Using mock data because:', {
            isNonCriticalEndpoint,
            errorMessage: error?.response?.data?.message || 'No error message'
          });
          const mockResponse = createMockResponse('server error');
          console.log('Mock response created:', mockResponse.data.data);
          return mockResponse;
        } catch (mockError) {
          console.error('Failed to create mock response:', mockError instanceof Error ? mockError.message : 'Unknown error');
          // Continue with throwing the original error
        }
      }
    }

    // For network errors, provide a more user-friendly message
    if (error?.message === 'Network Error') {
      try {
        console.error('Network error - server may be down or unreachable', {
          endpoint,
          method: config?.method || 'unknown'
        });
      } catch (logError) {
        console.error('Network error (failed to log details)');
      }

      error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection.';

      // We no longer use mock data for inspection endpoints
      // Only use mock data for truly non-critical endpoints
      const isNonCriticalEndpoint =
        endpoint.includes('documents') ||
        (endpoint.includes('applications') && method === 'GET' && !endpoint.includes('inspection'));

      if (isNonCriticalEndpoint) {
        try {
          console.warn(`Returning mock data for ${endpoint} due to network error`);
          console.warn('Using mock data for network error because:', {
            isNonCriticalEndpoint
          });
          const mockResponse = createMockResponse('network error');
          console.log('Mock response created for network error:', mockResponse.data.data);
          return mockResponse;
        } catch (mockError) {
          console.error('Failed to create mock response for network error:', mockError instanceof Error ? mockError.message : 'Unknown error');
          // Continue with throwing the original error
        }
      }
    }

    // For timeout errors
    if (error?.code === 'ECONNABORTED') {
      try {
        console.error('Request timeout - server took too long to respond', {
          endpoint,
          method: config?.method || 'unknown',
          timeout: config?.timeout || 'unknown'
        });
      } catch (logError) {
        console.error('Timeout error (failed to log details)');
      }

      error.friendlyMessage = 'The server is taking too long to respond. Please try again later.';

      // We no longer use mock data for inspection endpoints
      // Only use mock data for truly non-critical endpoints
      const isNonCriticalEndpoint =
        endpoint.includes('documents') ||
        (endpoint.includes('applications') && method === 'GET' && !endpoint.includes('inspection'));

      if (isNonCriticalEndpoint) {
        try {
          console.warn(`Returning mock data for ${endpoint} due to timeout`);
          return createMockResponse('timeout');
        } catch (mockError) {
          console.error('Failed to create mock response for timeout:', mockError instanceof Error ? mockError.message : 'Unknown error');
          // Continue with throwing the original error
        }
      }
    }

    // For any other errors that weren't handled above
    if (!error.friendlyMessage) {
      error.friendlyMessage = 'An unexpected error occurred. Please try again later.';

      // We no longer use mock data for inspection endpoints
      // Only use mock data for truly non-critical endpoints
      const isNonCriticalEndpoint =
        endpoint.includes('documents') ||
        (endpoint.includes('applications') && method === 'GET' && !endpoint.includes('inspection'));

      if (isNonCriticalEndpoint) {
        try {
          console.warn(`Returning mock data for ${endpoint} due to unhandled error`);
          return createMockResponse('unhandled error');
        } catch (mockError) {
          console.error('Failed to create mock response for unhandled error:', mockError instanceof Error ? mockError.message : 'Unknown error');
          // Continue with throwing the original error
        }
      }
    }

    throw error;
  }
};

// Convenience methods
export const get = <T>(endpoint: string, params?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>(endpoint, 'GET', params, config);

export const post = <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>(endpoint, 'POST', data, config);

export const put = <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) =>
  apiRequest<T>(endpoint, 'PUT', data, config);

export const del = <T>(endpoint: string, config?: AxiosRequestConfig) =>
  apiRequest<T>(endpoint, 'DELETE', undefined, config);

// Function to check if the token is valid
export const checkAuth = async (): Promise<boolean> => {
  try {
    const response = await get('auth/me');
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Function to refresh the token if needed
export const refreshToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await post<{ token: string }>('auth/refresh-token');

    // Check if response has data and data has a token property
    if (response.data?.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      document.cookie = `token=${response.data.data.token}; path=/;`;
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};
