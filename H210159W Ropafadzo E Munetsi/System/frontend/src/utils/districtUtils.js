import { get } from './api';

/**
 * Fetch all districts from the API
 * @returns {Promise<Array>} Array of district objects
 */
export const fetchDistricts = async () => {
  try {
    const response = await get('districts');
    
    if (response.data?.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Get a district by ID
 * @param {number} id - The district ID
 * @returns {Promise<Object|null>} District object or null if not found
 */
export const getDistrictById = async (id) => {
  try {
    const response = await get(`districts/${id}`);
    
    if (response.data?.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching district with ID ${id}:`, error);
    return null;
  }
};
