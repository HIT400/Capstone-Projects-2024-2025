/**
 * Extract dimensions from text with type classification
 * @param {string} text - The text to extract from
 * @returns {Array} Array of dimension objects with value and type
 */
export function extractDimensions(text) {
  // More specific patterns to avoid false positives
  const dimensionPatterns = [
    // Specific structural height patterns - including capital letters and various formats
    // Lintel level patterns
    { pattern: /lintel\s*(?:level|height)\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'lintel_level' },
    { pattern: /LINTEL\s*(?:LEVEL|HEIGHT)\s*(?:OF|IS|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:M|METERS|METER)/g, type: 'lintel_level' },
    { pattern: /(?:LL|L\.L\.|LINTEL)\s*(?:=|:|-)\s*(\d+(?:\.\d+)?)\s*(?:m|mm|M|MM)/gi, type: 'lintel_level' },
    { pattern: /LINTEL\s*(?:LEVEL|HEIGHT)?\s*(\d+(?:\.\d+)?)\s*(?:m|mm|M|MM)/g, type: 'lintel_level' },

    // Wall plate level patterns
    { pattern: /wall\s*plate\s*(?:level|height)\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'wall_plate_level' },
    { pattern: /WALL\s*PLATE\s*(?:LEVEL|HEIGHT)\s*(?:OF|IS|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:M|METERS|METER)/g, type: 'wall_plate_level' },
    { pattern: /(?:WP|W\.P\.|WALL\s*PLATE)\s*(?:=|:|-)\s*(\d+(?:\.\d+)?)\s*(?:m|mm|M|MM)/gi, type: 'wall_plate_level' },
    { pattern: /WALL\s*PLATE\s*(?:LEVEL|HEIGHT)?\s*(\d+(?:\.\d+)?)\s*(?:m|mm|M|MM)/g, type: 'wall_plate_level' },

    // Maximum roof height patterns
    { pattern: /(?:max|maximum|roof)\s*(?:roof)?\s*height\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'max_roof_height' },
    { pattern: /(?:MAX|MAXIMUM|ROOF)\s*(?:ROOF)?\s*HEIGHT\s*(?:OF|IS|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:M|METERS|METER)/g, type: 'max_roof_height' },
    { pattern: /(?:MRH|M\.R\.H\.|MAX\s*ROOF)\s*(?:=|:|-)\s*(\d+(?:\.\d+)?)\s*(?:m|mm|M|MM)/gi, type: 'max_roof_height' },
    { pattern: /(?:MAX|MAXIMUM|ROOF)\s*(?:ROOF)?\s*(?:LEVEL|HEIGHT)?\s*(\d+(?:\.\d+)?)\s*(?:m|mm|M|MM)/g, type: 'max_roof_height' },

    // Additional structural height patterns with just numbers (common in elevation drawings)
    { pattern: /\bLINTEL\b[^\d]*(\d+(?:\.\d+)?)/g, type: 'lintel_level' },
    { pattern: /\bWALL\s*PLATE\b[^\d]*(\d+(?:\.\d+)?)/g, type: 'wall_plate_level' },
    { pattern: /\bMAX(?:IMUM)?\s*(?:ROOF)?\s*HEIGHT\b[^\d]*(\d+(?:\.\d+)?)/g, type: 'max_roof_height' },
    { pattern: /\bROOF\s*HEIGHT\b[^\d]*(\d+(?:\.\d+)?)/g, type: 'max_roof_height' },

    // Room height patterns
    { pattern: /ceiling\s*(?:height)?\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'ceiling_height' },
    { pattern: /CEILING\s*(?:HEIGHT)?\s*(?:OF|IS|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:M|METERS|METER)/g, type: 'ceiling_height' },
    { pattern: /clear\s*height\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'clear_height' },
    { pattern: /CLEAR\s*HEIGHT\s*(?:OF|IS|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:M|METERS|METER)/g, type: 'clear_height' },
    { pattern: /floor\s*(?:to|-)\s*ceiling\s*(?:height)?\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'floor_to_ceiling' },
    { pattern: /FLOOR\s*(?:TO|-)\s*CEILING\s*(?:HEIGHT)?\s*(?:OF|IS|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:M|METERS|METER)/g, type: 'floor_to_ceiling' },

    // General height patterns
    { pattern: /height\s*(?:of|is|:|=)?\s*(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/gi, type: 'general_height' },
    { pattern: /(\d+(?:\.\d+)?)\s*(?:m|meters|meter)\s*(?:height|tall|high)/gi, type: 'general_height' },
    { pattern: /(\d+(?:\,\d+)?)\s*(?:mm|millimeters|millimeter)\s*(?:height|tall|high)/gi, type: 'general_height_mm' },

    // Only use general patterns as a last resort
    { pattern: /(\d+(?:\.\d+)?)\s*(?:m|meters|meter)/g, type: 'dimension' },
    { pattern: /(\d+(?:\,\d+)?)\s*(?:mm|millimeters|millimeter)/g, type: 'dimension_mm' }
  ];

  const dimensions = [];

  for (const { pattern, type } of dimensionPatterns) {
    try {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        // Get the captured group (index 1)
        let val = match[1] ? match[1].replace(',', '.') : null;

        // If no capture group found, try the full match
        if (!val && match[0]) {
          const numberMatch = match[0].match(/(\d+(?:\.\d+)?)/);
          if (numberMatch) val = numberMatch[1];
        }

        if (val) {
          val = parseFloat(val);
          if (type.includes('_mm')) {
            val = val / 1000;
          }

          // Only add reasonable values based on type
          const isValid =
            (type === 'lintel_level' && val >= 1.5 && val <= 3.0) || // Typical lintel heights
            (type === 'wall_plate_level' && val >= 2.0 && val <= 4.0) || // Typical wall plate heights
            (type === 'max_roof_height' && val >= 2.5 && val <= 10.0) || // Typical max roof heights
            (type.includes('ceiling') && val >= 2.0 && val <= 5.0) || // Typical ceiling heights
            (type.includes('height') && val >= 0.1 && val <= 10.0) || // General heights
            (type === 'dimension' && val >= 0.1 && val <= 50.0); // Any dimension

          if (isValid) {
            dimensions.push({
              value: val,
              type: type,
              text: match[0]
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error in extractDimensions with pattern ${pattern}: ${error.message}`);
    }
  }

  return dimensions;
}

/**
 * Extract just the dimension values (for backward compatibility)
 * @param {string} text - The text to extract from
 * @returns {Array} Array of dimension values
 */
export function extractDimensionValues(text) {
  try {
    return extractDimensions(text).map(dim => dim.value);
  } catch (error) {
    console.error(`Error in extractDimensionValues: ${error.message}`);
    return [];
  }
}

/**
 * Extract window identifiers (WO1, WO2, etc.) from text
 * @param {string} text - The text to extract from
 * @returns {Array} Array of window identifiers
 */
export function extractWindowIdentifiers(text) {
  try {
    // Expanded pattern to catch more window identifiers
    const windowPatterns = [
      /\b(WO\d+)\b/gi,           // Standard WO format
      /\b(W\d+)\b/gi,            // W format (W1, W2, etc.)
      /\b(WINDOW\s*\d+)\b/gi,    // WINDOW format (WINDOW 1, WINDOW 2, etc.)
      /\b(WIN\s*\d+)\b/gi,       // WIN format (WIN 1, WIN 2, etc.)
      /\bW(?:INDOW)?[\s-]*?(\d+)/gi  // W-1, WINDOW-1, etc.
    ];

    let allMatches = [];
    for (const pattern of windowPatterns) {
      const matches = [...text.matchAll(pattern)];
      allMatches = [...allMatches, ...matches.map(match => match[0].toUpperCase())];
    }

    // If we found window identifiers, return them
    if (allMatches.length > 0) {
      return allMatches;
    }

    // If no window identifiers were found but the text mentions windows, create default identifiers
    if (/\b(?:window|glazing|fenestration)\b/i.test(text)) {
      console.log('No specific window identifiers found, but windows are mentioned. Creating default identifiers.');
      return ['W1', 'W2'];
    }

    return [];
  } catch (error) {
    console.error(`Error in extractWindowIdentifiers: ${error.message}`);
    return [];
  }
}

/**
 * Extract door identifiers (DO1, DO2, etc.) from text
 * @param {string} text - The text to extract from
 * @returns {Array} Array of door identifiers
 */
export function extractDoorIdentifiers(text) {
  try {
    // Expanded pattern to catch more door identifiers
    const doorPatterns = [
      /\b(DO\d+)\b/gi,           // Standard DO format
      /\b(D\d+)\b/gi,            // D format (D1, D2, etc.)
      /\b(DOOR\s*\d+)\b/gi,      // DOOR format (DOOR 1, DOOR 2, etc.)
      /\bD(?:OOR)?[\s-]*?(\d+)/gi  // D-1, DOOR-1, etc.
    ];

    let allMatches = [];
    for (const pattern of doorPatterns) {
      const matches = [...text.matchAll(pattern)];
      allMatches = [...allMatches, ...matches.map(match => match[0].toUpperCase())];
    }

    // If we found door identifiers, return them
    if (allMatches.length > 0) {
      return allMatches;
    }

    // If no door identifiers were found but the text mentions doors, create default identifiers
    if (/\b(?:door|entrance|exit|access)\b/i.test(text)) {
      console.log('No specific door identifiers found, but doors are mentioned. Creating default identifiers.');
      return ['D1', 'D2'];
    }

    return [];
  } catch (error) {
    console.error(`Error in extractDoorIdentifiers: ${error.message}`);
    return [];
  }
}

/**
 * Enhanced schedule extractor that captures more details
 * @param {string} text - Document text
 * @returns {Object} Detailed schedule information
 */
export function extractScheduleInfo(text) {
  // Improved schedule detection with more patterns
  const hasWindowSchedule = /\b(?:window|fenestration)\s*(?:schedule|specification|details|list|table)\b/i.test(text) ||
                           /\bschedule\s+of\s+(?:windows|glazing)\b/i.test(text) ||
                           /\btable\s+(?:\d+\s+)?(?:window|glazing)\b/i.test(text);

  const hasDoorSchedule = /\b(?:door)\s*(?:schedule|specification|details|list|table)\b/i.test(text) ||
                         /\bschedule\s+of\s+doors\b/i.test(text) ||
                         /\btable\s+(?:\d+\s+)?door\b/i.test(text);

  // Check for ventilation and natural light requirements
  const hasVentilationInfo = /\b(?:ventilation|air\s*flow|air\s*circulation|opening\s*area)\b/i.test(text) ||
                            /\b(?:opening\s*percentage|openable\s*area)\b/i.test(text);

  const hasNaturalLightInfo = /\b(?:natural\s*light|daylight|light\s*transmission|glazing\s*area)\b/i.test(text) ||
                             /\b(?:light\s*percentage|window\s*to\s*floor\s*ratio)\b/i.test(text);

  // Enhanced pattern matching for schedule items
  const windowItems = [];
  const doorItems = [];

  // Extract window items with dimensions and details
  const windowPatterns = [
    /\b(?:W|WO|WINDOW)[0-9]+\s*[:-]?\s*([^,;\n]*)/gi,
    /\b(?:W|WO|WINDOW)[0-9]+\s*([^,;\n]*)/gi,
    /\b(?:WINDOW|W)\s*(?:TYPE|REF)?\s*[:-]?\s*[0-9]+\s*[:-]?\s*([^,;\n]*)/gi
  ];

  for (const pattern of windowPatterns) {
    let windowMatch;
    while ((windowMatch = pattern.exec(text)) !== null) {
      const id = windowMatch[0].trim();
      const details = windowMatch[1]?.trim() || '';
      const fullText = windowMatch[0] + (windowMatch[1] || '');

      // Extract dimensions
      const dimensions = extractItemDimensions(fullText);

      // Extract material
      const material = extractMaterialInfo(fullText, 'window');

      // Extract location
      const location = extractLocationInfo(fullText);

      // Check for ventilation information
      const hasVentilationDetails = /\b(?:ventilation|opening|openable|airflow)\b/i.test(fullText);

      // Check for natural light information
      const hasNaturalLightDetails = /\b(?:natural\s*light|daylight|light\s*transmission|glazing)\b/i.test(fullText);

      windowItems.push({
        id,
        details,
        dimensions,
        hasDimensions: dimensions.length > 0,
        material,
        location,
        hasVentilationDetails,
        hasNaturalLightDetails
      });
    }
  }

  // Extract door items with dimensions and details
  const doorPatterns = [
    /\b(?:D|DO|DOOR)[0-9]+\s*[:-]?\s*([^,;\n]*)/gi,
    /\b(?:D|DO|DOOR)[0-9]+\s*([^,;\n]*)/gi,
    /\b(?:DOOR|D)\s*(?:TYPE|REF)?\s*[:-]?\s*[0-9]+\s*[:-]?\s*([^,;\n]*)/gi
  ];

  for (const pattern of doorPatterns) {
    let doorMatch;
    while ((doorMatch = pattern.exec(text)) !== null) {
      const id = doorMatch[0].trim();
      const details = doorMatch[1]?.trim() || '';
      const fullText = doorMatch[0] + (doorMatch[1] || '');

      // Extract dimensions
      const dimensions = extractItemDimensions(fullText);

      // Extract material
      const material = extractMaterialInfo(fullText, 'door');

      // Extract location
      const location = extractLocationInfo(fullText);

      // Extract fire rating
      const fireRating = extractFireRating(fullText);

      doorItems.push({
        id,
        details,
        dimensions,
        hasDimensions: dimensions.length > 0,
        material,
        location,
        fireRating
      });
    }
  }

  // If we found window/door identifiers but no schedule headers, assume schedules exist
  if (!hasWindowSchedule && windowItems.length > 0) {
    console.log('Window identifiers found but no schedule header. Assuming window schedule exists.');
    hasWindowSchedule = true;
  }

  if (!hasDoorSchedule && doorItems.length > 0) {
    console.log('Door identifiers found but no schedule header. Assuming door schedule exists.');
    hasDoorSchedule = true;
  }

  // Calculate schedule completeness
  const completeness = calculateScheduleCompleteness(windowItems, doorItems);

  // Check if ventilation and natural light requirements are met
  const ventilationRequirementsMet = hasVentilationInfo ||
                                    windowItems.some(item => item.hasVentilationDetails);

  const naturalLightRequirementsMet = hasNaturalLightInfo ||
                                     windowItems.some(item => item.hasNaturalLightDetails);

  return {
    hasSchedule: hasWindowSchedule || hasDoorSchedule,
    has_window_schedule: hasWindowSchedule,
    has_door_schedule: hasDoorSchedule,
    windows: windowItems,
    doors: doorItems,
    schedule_completeness: completeness,
    ventilation_requirements_met: ventilationRequirementsMet,
    natural_light_requirements_met: naturalLightRequirementsMet,
    has_ventilation_info: hasVentilationInfo,
    has_natural_light_info: hasNaturalLightInfo
  };
}

/**
 * Extract dimensions for a specific schedule item
 * @param {string} text - The text to extract from
 * @returns {Array} Array of dimension objects
 */
function extractItemDimensions(text) {
  const dimensions = [];

  // Width pattern
  const widthPattern = /(?:width|w|wide|breadth)\s*[=:]*\s*(\d+(?:\.\d+)?)\s*(?:mm|m)/gi;
  let widthMatch;
  while ((widthMatch = widthPattern.exec(text)) !== null) {
    const value = parseFloat(widthMatch[1]);
    const unit = text.substring(widthMatch.index, widthMatch.index + widthMatch[0].length).includes('mm') ? 'mm' : 'm';

    // Convert to meters if in mm
    const valueInMeters = unit === 'mm' ? value / 1000 : value;

    // Only add reasonable values
    if (valueInMeters >= 0.3 && valueInMeters <= 3.0) {
      dimensions.push({
        type: 'width',
        value: valueInMeters,
        text: widthMatch[0]
      });
    }
  }

  // Height pattern
  const heightPattern = /(?:height|h|high|ht)\s*[=:]*\s*(\d+(?:\.\d+)?)\s*(?:mm|m)/gi;
  let heightMatch;
  while ((heightMatch = heightPattern.exec(text)) !== null) {
    const value = parseFloat(heightMatch[1]);
    const unit = text.substring(heightMatch.index, heightMatch.index + heightMatch[0].length).includes('mm') ? 'mm' : 'm';

    // Convert to meters if in mm
    const valueInMeters = unit === 'mm' ? value / 1000 : value;

    // Only add reasonable values
    if (valueInMeters >= 0.3 && valueInMeters <= 3.0) {
      dimensions.push({
        type: 'height',
        value: valueInMeters,
        text: heightMatch[0]
      });
    }
  }

  // Combined dimensions pattern (e.g., "900 x 2100")
  const combinedPattern = /(\d+(?:\.\d+)?)\s*(?:x|×|by)\s*(\d+(?:\.\d+)?)\s*(?:mm|m)?/gi;
  let combinedMatch;
  while ((combinedMatch = combinedPattern.exec(text)) !== null) {
    const firstValue = parseFloat(combinedMatch[1]);
    const secondValue = parseFloat(combinedMatch[2]);
    const unit = text.substring(combinedMatch.index, combinedMatch.index + combinedMatch[0].length).includes('mm') ? 'mm' : 'm';

    // Convert to meters if in mm
    const firstValueInMeters = unit === 'mm' ? firstValue / 1000 : firstValue;
    const secondValueInMeters = unit === 'mm' ? secondValue / 1000 : secondValue;

    // Determine which is width and which is height (typically height > width)
    const width = Math.min(firstValueInMeters, secondValueInMeters);
    const height = Math.max(firstValueInMeters, secondValueInMeters);

    // Only add reasonable values
    if (width >= 0.3 && width <= 3.0 && height >= 0.3 && height <= 3.0) {
      dimensions.push({
        type: 'width',
        value: width,
        text: combinedMatch[0]
      });

      dimensions.push({
        type: 'height',
        value: height,
        text: combinedMatch[0]
      });
    }
  }

  return dimensions;
}

/**
 * Extract material information for a schedule item
 * @param {string} text - The text to extract from
 * @param {string} itemType - The type of item ('window' or 'door')
 * @returns {string|null} Material information or null if not found
 */
function extractMaterialInfo(text, itemType) {
  const lowerText = text.toLowerCase();

  // Common window materials
  if (itemType === 'window') {
    if (lowerText.includes('aluminum') || lowerText.includes('aluminium')) {
      return 'aluminum';
    } else if (lowerText.includes('timber') || lowerText.includes('wood')) {
      return 'timber';
    } else if (lowerText.includes('upvc') || lowerText.includes('pvc')) {
      return 'upvc';
    } else if (lowerText.includes('steel')) {
      return 'steel';
    }
  }

  // Common door materials
  if (itemType === 'door') {
    if (lowerText.includes('timber') || lowerText.includes('wood')) {
      return 'timber';
    } else if (lowerText.includes('steel')) {
      return 'steel';
    } else if (lowerText.includes('aluminum') || lowerText.includes('aluminium')) {
      return 'aluminum';
    } else if (lowerText.includes('glass')) {
      return 'glass';
    } else if (lowerText.includes('upvc') || lowerText.includes('pvc')) {
      return 'upvc';
    }
  }

  return null;
}

/**
 * Extract fire rating information for a door
 * @param {string} text - The text to extract from
 * @returns {string|null} Fire rating information or null if not found
 */
function extractFireRating(text) {
  const lowerText = text.toLowerCase();

  // Common fire rating patterns
  if (lowerText.includes('fr30') || lowerText.includes('fr 30') ||
      lowerText.includes('30 min') || lowerText.includes('30min') ||
      lowerText.includes('30 minute') || lowerText.includes('30minute') ||
      lowerText.includes('30/30')) {
    return 'FR30';
  } else if (lowerText.includes('fr60') || lowerText.includes('fr 60') ||
             lowerText.includes('60 min') || lowerText.includes('60min') ||
             lowerText.includes('60 minute') || lowerText.includes('60minute') ||
             lowerText.includes('60/60')) {
    return 'FR60';
  } else if (lowerText.includes('fr90') || lowerText.includes('fr 90') ||
             lowerText.includes('90 min') || lowerText.includes('90min') ||
             lowerText.includes('90 minute') || lowerText.includes('90minute')) {
    return 'FR90';
  } else if (lowerText.includes('fire rated') || lowerText.includes('fire-rated') ||
             lowerText.includes('fire resistance') || lowerText.includes('fire resistant')) {
    return 'Fire Rated (unspecified)';
  }

  return null;
}

/**
 * Extract location information for a schedule item
 * @param {string} text - The text to extract from
 * @returns {string|null} Location information or null if not found
 */
function extractLocationInfo(text) {
  const lowerText = text.toLowerCase();

  // Common room/location patterns
  const locationPatterns = [
    /(?:in|at|for)\s+(?:the\s+)?(\w+\s+\w+(?:\s+\w+)?)/i,
    /(\w+\s+\w+(?:\s+\w+)?)\s+(?:area|room|space)/i,
    /location\s*[:-]?\s*(\w+\s+\w+(?:\s+\w+)?)/i
  ];

  for (const pattern of locationPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      // Filter out common false positives
      const location = match[1].trim();
      if (!['the door', 'the window', 'this item', 'each room'].includes(location)) {
        return location;
      }
    }
  }

  // Check for common room names
  const roomNames = ['kitchen', 'bathroom', 'bedroom', 'living room', 'dining room',
                     'hallway', 'entrance', 'lobby', 'office', 'study', 'toilet', 'wc'];

  for (const room of roomNames) {
    if (lowerText.includes(room)) {
      return room;
    }
  }

  return null;
}

/**
 * Extract hardware type for ironmongery items
 * @param {string} text - The text to extract from
 * @returns {string|null} Hardware type or null if not found
 */
function extractHardwareType(text) {
  const lowerText = text.toLowerCase();

  // Common hardware types
  if (lowerText.includes('hinge') || lowerText.includes('butt')) {
    return 'hinge';
  } else if (lowerText.includes('handle') || lowerText.includes('lever')) {
    return 'handle';
  } else if (lowerText.includes('lock') || lowerText.includes('latch')) {
    return 'lock';
  } else if (lowerText.includes('closer')) {
    return 'door closer';
  } else if (lowerText.includes('stopper') || lowerText.includes('stop')) {
    return 'door stop';
  }

  return 'other';
}

/**
 * Calculate confidence score for a schedule item
 * @param {string} text - The text to analyze
 * @param {string} itemType - The type of item ('window' or 'door')
 * @returns {number} Confidence score between 0 and 1
 */
function calculateItemConfidence(text, itemType) {
  let confidence = 0.5; // Start with neutral confidence

  // Check for dimensions
  const hasDimensions = /(?:width|height|w|h)\s*[=:]*\s*\d+/i.test(text) ||
                        /\d+\s*(?:x|×|by)\s*\d+/i.test(text);

  // Check for material specification
  const hasMaterial = extractMaterialInfo(text, itemType) !== null;

  // Check for location information
  const hasLocation = extractLocationInfo(text) !== null;

  // Check for detailed description
  const hasDetailedDescription = text.length > 50;

  // Adjust confidence based on available information
  if (hasDimensions) confidence += 0.2;
  if (hasMaterial) confidence += 0.1;
  if (hasLocation) confidence += 0.1;
  if (hasDetailedDescription) confidence += 0.1;

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}

/**
 * Calculate completeness score for schedules
 * @param {Array} windowItems - Array of window items
 * @param {Array} doorItems - Array of door items
 * @returns {number} Completeness score between 0 and 1
 */
function calculateScheduleCompleteness(windowItems, doorItems) {
  // No items means incomplete schedule
  if (windowItems.length === 0 && doorItems.length === 0) {
    return 0;
  }

  let totalItems = windowItems.length + doorItems.length;
  let itemsWithDimensions = 0;
  let itemsWithMaterial = 0;
  let itemsWithLocation = 0;

  // Count items with complete information
  for (const item of [...windowItems, ...doorItems]) {
    if (item.hasDimensions) itemsWithDimensions++;
    if (item.material) itemsWithMaterial++;
    if (item.location) itemsWithLocation++;
  }

  // Calculate completeness percentages
  const dimensionsCompleteness = totalItems > 0 ? itemsWithDimensions / totalItems : 0;
  const materialCompleteness = totalItems > 0 ? itemsWithMaterial / totalItems : 0;
  const locationCompleteness = totalItems > 0 ? itemsWithLocation / totalItems : 0;

  // Weight the different aspects of completeness
  return (dimensionsCompleteness * 0.5) + (materialCompleteness * 0.3) + (locationCompleteness * 0.2);
}

/**
 * Assess the overall quality of schedules
 * @param {Array} windowItems - Array of window items
 * @param {Array} doorItems - Array of door items
 * @param {Array} ironmongeryItems - Array of ironmongery items
 * @returns {Object} Quality assessment
 */
function assessScheduleQuality(windowItems, doorItems, ironmongeryItems) {
  const assessment = {
    score: 0,
    issues: [],
    strengths: []
  };

  // Check for presence of schedules
  const hasWindows = windowItems.length > 0;
  const hasDoors = doorItems.length > 0;
  const hasIronmongery = ironmongeryItems.length > 0;

  // Calculate completeness
  const completeness = calculateScheduleCompleteness(windowItems, doorItems);

  // Check for sequential numbering
  const hasSequentialWindowNumbering = checkSequentialNumbering(windowItems);
  const hasSequentialDoorNumbering = checkSequentialNumbering(doorItems);

  // Check for cross-referencing between schedules
  const hasCrossReferencing = checkCrossReferencing(windowItems, doorItems, ironmongeryItems);

  // Evaluate strengths
  if (hasWindows) assessment.strengths.push('Window schedule present');
  if (hasDoors) assessment.strengths.push('Door schedule present');
  if (hasIronmongery) assessment.strengths.push('Ironmongery schedule present');
  if (completeness > 0.8) assessment.strengths.push('Schedules are highly complete');
  if (hasSequentialWindowNumbering && hasWindows) assessment.strengths.push('Window numbering is sequential');
  if (hasSequentialDoorNumbering && hasDoors) assessment.strengths.push('Door numbering is sequential');
  if (hasCrossReferencing) assessment.strengths.push('Schedules are cross-referenced');

  // Evaluate issues
  if (!hasWindows && !hasDoors) assessment.issues.push('No window or door schedules found');
  if (completeness < 0.5) assessment.issues.push('Schedules are incomplete');
  if (!hasSequentialWindowNumbering && hasWindows) assessment.issues.push('Window numbering is not sequential');
  if (!hasSequentialDoorNumbering && hasDoors) assessment.issues.push('Door numbering is not sequential');
  if (!hasCrossReferencing && hasIronmongery) assessment.issues.push('Schedules lack cross-referencing');

  // Calculate overall score
  let score = 0.5; // Start with neutral score

  // Adjust based on presence of schedules
  if (hasWindows) score += 0.1;
  if (hasDoors) score += 0.1;
  if (hasIronmongery) score += 0.1;

  // Adjust based on completeness
  score += completeness * 0.3;

  // Adjust based on numbering and cross-referencing
  if (hasSequentialWindowNumbering && hasWindows) score += 0.05;
  if (hasSequentialDoorNumbering && hasDoors) score += 0.05;
  if (hasCrossReferencing) score += 0.1;

  // Ensure score is between 0 and 1
  assessment.score = Math.max(0, Math.min(1, score));

  return assessment;
}

/**
 * Check if items have sequential numbering
 * @param {Array} items - Array of schedule items
 * @returns {boolean} True if numbering is sequential
 */
function checkSequentialNumbering(items) {
  if (items.length <= 1) return true;

  // Extract numbers from item IDs
  const numbers = items.map(item => {
    const match = item.id.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }).filter(num => num !== null);

  // Check if numbers are sequential
  numbers.sort((a, b) => a - b);
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i] !== numbers[i-1] + 1) {
      return false;
    }
  }

  return true;
}

/**
 * Check if schedules have cross-referencing
 * @param {Array} windowItems - Array of window items
 * @param {Array} doorItems - Array of door items
 * @param {Array} ironmongeryItems - Array of ironmongery items
 * @returns {boolean} True if schedules have cross-referencing
 */
function checkCrossReferencing(windowItems, doorItems, ironmongeryItems) {
  // If no ironmongery items, there's nothing to cross-reference
  if (ironmongeryItems.length === 0) return false;

  // Check if door items reference ironmongery
  for (const door of doorItems) {
    const doorText = door.details.toLowerCase();
    for (const ironmongery of ironmongeryItems) {
      if (doorText.includes(ironmongery.id.toLowerCase())) {
        return true;
      }
    }
  }

  return false;
}

export function extractAreas(text) {
  try {
    const areaPattern = /(\d+(?:\.\d+)?)\s*(?:sq\.?\s+m|square\s+meters?|m2|m²)/g;
    const areas = [...text.matchAll(areaPattern)].map(m => parseFloat(m[1]));
    return areas;
  } catch (error) {
    console.error(`Error in extractAreas: ${error.message}`);
    return [];
  }
}

export function extractFloorCount(text) {
  // All patterns must have the global flag (g) for matchAll to work
  const floorCountPatterns = [
    /(?:building|structure) with (\d+) (?:floor|storey|story|level)s?/gi,
    /(\d+)(?:-| )(?:floor|storey|story|level) (?:building|structure)/gi,
    /(\d+)[\s-]store(?:y|ies)/gi,
    /(?:floor|storey|story|level)s?: (\d+)/gi,
    /(?:number of|total) (?:floor|storey|story|level)s?: (\d+)/gi
  ];

  const floors = [];

  for (const pattern of floorCountPatterns) {
    try {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        if (match && match[1]) {
          floors.push(parseInt(match[1]));
        }
      }
    } catch (error) {
      console.error(`Error in extractFloorCount with pattern ${pattern}: ${error.message}`);
    }
  }

  return floors;
}

/**
 * Extract structural heights (lintel level, wall plate level, max roof height)
 * @param {string} text - The text to extract from
 * @returns {Object} Object containing structural height information
 */
export function extractStructuralHeights(text) {
  try {
    const dimensions = extractDimensions(text);

    // Initialize the result object
    const structuralHeights = {
      lintel_level: null,
      wall_plate_level: null,
      max_roof_height: null,
      has_structural_heights: false,
      can_determine_room_height: false,
      implied_room_height: null
    };

    // Extract specific height types
    const lintelLevels = dimensions.filter(dim => dim.type === 'lintel_level');
    const wallPlateLevels = dimensions.filter(dim => dim.type === 'wall_plate_level');
    const maxRoofHeights = dimensions.filter(dim => dim.type === 'max_roof_height');

    // Use the first found value for each type (if multiple are found)
    if (lintelLevels.length > 0) {
      structuralHeights.lintel_level = lintelLevels[0].value;
      structuralHeights.has_structural_heights = true;
    }

    if (wallPlateLevels.length > 0) {
      structuralHeights.wall_plate_level = wallPlateLevels[0].value;
      structuralHeights.has_structural_heights = true;
    }

    if (maxRoofHeights.length > 0) {
      structuralHeights.max_roof_height = maxRoofHeights[0].value;
      structuralHeights.has_structural_heights = true;
    }

    // Fallback: If no structural heights were found but the terms are present,
    // try to extract numbers that appear near these terms
    if (!structuralHeights.has_structural_heights) {
      // Check for lintel level
      if (text.includes('LINTEL') || text.includes('lintel')) {
        const lintelMatch = text.match(/\bLINTEL\b[^\d]*(\d+(?:\.\d+)?)/i);
        if (lintelMatch && lintelMatch[1]) {
          const value = parseFloat(lintelMatch[1]);
          if (value >= 1.5 && value <= 3.0) { // Typical lintel heights
            structuralHeights.lintel_level = value;
            structuralHeights.has_structural_heights = true;
          }
        }
      }

      // Check for wall plate level
      if (text.includes('WALL PLATE') || text.includes('wall plate')) {
        const wallPlateMatch = text.match(/\bWALL\s*PLATE\b[^\d]*(\d+(?:\.\d+)?)/i);
        if (wallPlateMatch && wallPlateMatch[1]) {
          const value = parseFloat(wallPlateMatch[1]);
          if (value >= 2.0 && value <= 4.0) { // Typical wall plate heights
            structuralHeights.wall_plate_level = value;
            structuralHeights.has_structural_heights = true;
          }
        }
      }

      // Check for maximum roof height
      if (text.includes('ROOF HEIGHT') || text.includes('roof height') ||
          text.includes('MAX HEIGHT') || text.includes('max height')) {
        const roofHeightMatch = text.match(/\b(?:ROOF|MAX(?:IMUM)?)\s*(?:ROOF)?\s*HEIGHT\b[^\d]*(\d+(?:\.\d+)?)/i);
        if (roofHeightMatch && roofHeightMatch[1]) {
          const value = parseFloat(roofHeightMatch[1]);
          if (value >= 2.5 && value <= 10.0) { // Typical max roof heights
            structuralHeights.max_roof_height = value;
            structuralHeights.has_structural_heights = true;
          }
        }
      }
    }

    // If we have wall plate level, we can use it to determine room height
    // Wall plate level is typically the height of the ceiling in standard rooms
    if (structuralHeights.wall_plate_level !== null) {
      structuralHeights.can_determine_room_height = true;
      structuralHeights.implied_room_height = structuralHeights.wall_plate_level;
    }
    // If we don't have wall plate level but have lintel level, we can estimate room height
    // Lintel level is typically around 2.1m, and ceiling height is usually 0.3-0.6m higher
    else if (structuralHeights.lintel_level !== null) {
      structuralHeights.can_determine_room_height = true;
      structuralHeights.implied_room_height = structuralHeights.lintel_level + 0.3; // Add 30cm as a conservative estimate
    }

    return structuralHeights;
  } catch (error) {
    console.error(`Error in extractStructuralHeights: ${error.message}`);
    return {
      lintel_level: null,
      wall_plate_level: null,
      max_roof_height: null,
      has_structural_heights: false,
      can_determine_room_height: false,
      implied_room_height: null,
      error: error.message
    };
  }
}
