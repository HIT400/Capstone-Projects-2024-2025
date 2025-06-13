  export const parseAtomicWeight = (atomicWeight: string): string => {
    // Remove parentheses and trim spaces
    const cleanedString = atomicWeight.replace(/[()]/g, '').trim();
  
    // Check if the cleaned string can be converted to a float or int
    const number = parseFloat(cleanedString);
  
    // If it's a valid number, return it as a string
    if (!isNaN(number)) {
      return number.toString(); // Return as string
    }
  
    // If the value is not a valid number, return a default or error value as a string
    return '0'; // Default to '0' as a string if not valid
  };
  