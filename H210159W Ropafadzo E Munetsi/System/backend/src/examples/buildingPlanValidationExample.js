// Example of how to use the building standards validation system
import buildingStandards from '../data/buildingStandards.js';

/**
 * Example function demonstrating how to validate a building plan against standards
 * and generate a compliance report with percentage of compliant issues
 * 
 * @param {Object} planData - Extracted data from the building plan
 * @returns {Object} - Compliance report with percentages
 */
function validateBuildingPlan(planData) {
  // Initialize a compliance tracker
  const tracker = buildingStandards.validation.compliance.createComplianceTracker();
  
  // Example validation for general plan requirements
  validateGeneralRequirements(planData, tracker);
  
  // Example validation for floor plans
  validateFloorPlans(planData, tracker);
  
  // Example validation for elevations
  validateElevations(planData, tracker);
  
  // Example validation for sections
  validateSections(planData, tracker);
  
  // Example validation for schedules
  validateSchedules(planData, tracker);
  
  // Generate and return the compliance report
  return buildingStandards.validation.compliance.generateComplianceReport(tracker);
}

/**
 * Validate general plan requirements
 */
function validateGeneralRequirements(planData, tracker) {
  const { general_plan_requirements } = buildingStandards;
  
  // Check document size
  if (planData.documentSize) {
    const validSizes = ['A0', 'A1', 'A2', 'A3'];
    const isValidSize = validSizes.includes(planData.documentSize);
    
    buildingStandards.validation.compliance.recordValidationResult(
      tracker,
      'General Requirements',
      'Document Size',
      isValidSize,
      isValidSize ? null : `Document size ${planData.documentSize} is not one of the approved sizes: ${validSizes.join(', ')}`
    );
  }
  
  // Check if all required components are present
  if (planData.components) {
    const requiredComponents = general_plan_requirements.required_plan_components;
    
    requiredComponents.forEach(component => {
      const hasComponent = planData.components.includes(component);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'General Requirements',
        `Required Component: ${component}`,
        hasComponent,
        hasComponent ? null : `Required component "${component}" is missing from the plan`
      );
    });
  }
  
  // Check scales
  if (planData.scales) {
    // Check site plan scale
    if (planData.scales.sitePlan && planData.siteArea) {
      let validScales;
      
      if (planData.siteArea > 10000) { // 1 hectare in square meters
        validScales = ['1:2000', '1:1000', '1:500'];
      } else {
        validScales = ['1:500', '1:200', '1:100'];
      }
      
      const isValidScale = validScales.includes(planData.scales.sitePlan);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'General Requirements',
        'Site Plan Scale',
        isValidScale,
        isValidScale ? null : `Site plan scale ${planData.scales.sitePlan} is not one of the approved scales for site area ${planData.siteArea} m²: ${validScales.join(', ')}`
      );
    }
    
    // Check floor plan scale
    if (planData.scales.floorPlan) {
      const validScales = ['1:100', '1:50'];
      const isValidScale = validScales.includes(planData.scales.floorPlan);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'General Requirements',
        'Floor Plan Scale',
        isValidScale,
        isValidScale ? null : `Floor plan scale ${planData.scales.floorPlan} is not one of the approved scales: ${validScales.join(', ')}`
      );
    }
  }
}

/**
 * Validate floor plans
 */
function validateFloorPlans(planData, tracker) {
  const { floor_plans, technical_standards } = buildingStandards;
  
  // Check room dimensions
  if (planData.rooms) {
    planData.rooms.forEach((room, index) => {
      // Check ceiling height for habitable rooms
      if (room.type === 'habitable' && room.ceilingHeight) {
        const minHeight = technical_standards.room_dimensions.clear_height.habitable_rooms;
        const isValidHeight = buildingStandards.validation.methods.validateMinimum(room.ceilingHeight, minHeight);
        
        buildingStandards.validation.compliance.recordValidationResult(
          tracker,
          'Floor Plans',
          `Room ${index + 1} Ceiling Height`,
          isValidHeight,
          isValidHeight ? null : `Room ${index + 1} ceiling height (${room.ceilingHeight}m) is less than the minimum required (${minHeight}m)`
        );
      }
      
      // Check floor area for habitable rooms
      if (room.type === 'habitable' && room.floorArea) {
        const minArea = technical_standards.room_dimensions.floor_area.habitable_rooms_min;
        const isValidArea = buildingStandards.validation.methods.validateMinimum(room.floorArea, minArea);
        
        buildingStandards.validation.compliance.recordValidationResult(
          tracker,
          'Floor Plans',
          `Room ${index + 1} Floor Area`,
          isValidArea,
          isValidArea ? null : `Room ${index + 1} floor area (${room.floorArea}m²) is less than the minimum required (${minArea}m²)`
        );
      }
    });
  }
  
  // Check if all required elements are shown in the floor plan
  if (planData.floorPlanElements) {
    const requiredElements = Object.keys(floor_plans.required_elements);
    
    requiredElements.forEach(element => {
      const hasElement = planData.floorPlanElements.includes(element);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'Floor Plans',
        `Required Element: ${element}`,
        hasElement,
        hasElement ? null : `Required floor plan element "${element}" is missing`
      );
    });
  }
}

/**
 * Validate elevations
 */
function validateElevations(planData, tracker) {
  const { elevation_drawings } = buildingStandards;
  
  // Check if all required elevations are present
  if (planData.elevations) {
    const requiredElevations = elevation_drawings.required_elevations;
    
    requiredElevations.forEach(elevation => {
      const hasElevation = planData.elevations.some(e => e.name === elevation);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'Elevations',
        `Required Elevation: ${elevation}`,
        hasElevation,
        hasElevation ? null : `Required elevation "${elevation}" is missing`
      );
    });
    
    // Check if elevations include all required elements
    if (planData.elevations.length > 0) {
      const requiredElements = Object.keys(elevation_drawings.elements_to_include);
      
      planData.elevations.forEach(elevation => {
        requiredElements.forEach(element => {
          const hasElement = elevation.elements && elevation.elements.includes(element);
          
          buildingStandards.validation.compliance.recordValidationResult(
            tracker,
            'Elevations',
            `${elevation.name} - Element: ${element}`,
            hasElement,
            hasElement ? null : `Required element "${element}" is missing from ${elevation.name}`
          );
        });
      });
    }
  }
}

/**
 * Validate sections
 */
function validateSections(planData, tracker) {
  const { section_drawings } = buildingStandards;
  
  // Check if section drawings are present
  if (planData.sections) {
    // Check if sections include all required measurements
    const requiredMeasurements = Object.keys(section_drawings.required_measurements);
    
    planData.sections.forEach(section => {
      requiredMeasurements.forEach(measurement => {
        const hasMeasurement = section.measurements && section.measurements.includes(measurement);
        
        buildingStandards.validation.compliance.recordValidationResult(
          tracker,
          'Sections',
          `${section.name} - Measurement: ${measurement}`,
          hasMeasurement,
          hasMeasurement ? null : `Required measurement "${measurement}" is missing from ${section.name}`
        );
      });
    });
    
    // Check if sections include all required construction details
    const requiredDetails = Object.keys(section_drawings.construction_details);
    
    planData.sections.forEach(section => {
      requiredDetails.forEach(detail => {
        const hasDetail = section.constructionDetails && section.constructionDetails.includes(detail);
        
        buildingStandards.validation.compliance.recordValidationResult(
          tracker,
          'Sections',
          `${section.name} - Construction Detail: ${detail}`,
          hasDetail,
          hasDetail ? null : `Required construction detail "${detail}" is missing from ${section.name}`
        );
      });
    });
  } else {
    buildingStandards.validation.compliance.recordValidationResult(
      tracker,
      'Sections',
      'Section Drawings',
      false,
      'No section drawings found in the plan'
    );
  }
}

/**
 * Validate schedules
 */
function validateSchedules(planData, tracker) {
  const { schedules } = buildingStandards;
  
  // Check window schedule
  if (planData.windowSchedule) {
    const requiredInfo = schedules.window_schedule.required_information;
    
    requiredInfo.forEach(info => {
      const hasInfo = planData.windowSchedule.columns && planData.windowSchedule.columns.includes(info);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'Schedules',
        `Window Schedule - ${info}`,
        hasInfo,
        hasInfo ? null : `Required information "${info}" is missing from window schedule`
      );
    });
  } else {
    buildingStandards.validation.compliance.recordValidationResult(
      tracker,
      'Schedules',
      'Window Schedule',
      false,
      'No window schedule found in the plan'
    );
  }
  
  // Check door schedule
  if (planData.doorSchedule) {
    const requiredInfo = schedules.door_schedule.required_information;
    
    requiredInfo.forEach(info => {
      const hasInfo = planData.doorSchedule.columns && planData.doorSchedule.columns.includes(info);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'Schedules',
        `Door Schedule - ${info}`,
        hasInfo,
        hasInfo ? null : `Required information "${info}" is missing from door schedule`
      );
    });
  } else {
    buildingStandards.validation.compliance.recordValidationResult(
      tracker,
      'Schedules',
      'Door Schedule',
      false,
      'No door schedule found in the plan'
    );
  }
  
  // Check ironmongery schedule
  if (planData.ironmongerySchedule) {
    const requiredInfo = schedules.ironmongery_schedule.required_information;
    
    requiredInfo.forEach(info => {
      const hasInfo = planData.ironmongerySchedule.columns && planData.ironmongerySchedule.columns.includes(info);
      
      buildingStandards.validation.compliance.recordValidationResult(
        tracker,
        'Schedules',
        `Ironmongery Schedule - ${info}`,
        hasInfo,
        hasInfo ? null : `Required information "${info}" is missing from ironmongery schedule`
      );
    });
  } else {
    buildingStandards.validation.compliance.recordValidationResult(
      tracker,
      'Schedules',
      'Ironmongery Schedule',
      false,
      'No ironmongery schedule found in the plan'
    );
  }
}

// Example usage
const samplePlanData = {
  documentSize: 'A1',
  components: [
    'Project Information',
    'Site Plan',
    'Floor Plans',
    'Elevations (South, North, East, West)',
    'Section Drawings (A-A or A1-A1)',
    'Window, Door, and Ironmongery Schedules'
  ],
  siteArea: 8500, // square meters
  scales: {
    sitePlan: '1:500',
    floorPlan: '1:100',
    elevations: '1:100',
    sections: '1:50'
  },
  rooms: [
    { type: 'habitable', name: 'Living Room', ceilingHeight: 2.5, floorArea: 18 },
    { type: 'habitable', name: 'Bedroom 1', ceilingHeight: 2.4, floorArea: 12 },
    { type: 'habitable', name: 'Bedroom 2', ceilingHeight: 2.3, floorArea: 6 }, // Too small
    { type: 'non-habitable', name: 'Bathroom', ceilingHeight: 2.2, floorArea: 5 }
  ],
  floorPlanElements: [
    'room_layout',
    'room_dimensions',
    'wall_thicknesses',
    'door_and_window_positions',
    'structural_elements',
    'fixtures_and_fittings'
    // Missing 'circulation'
  ],
  elevations: [
    { 
      name: 'North Elevation',
      elements: [
        'ground_level',
        'floor_levels',
        'overall_height',
        'roof_details',
        'openings',
        'external_features'
      ]
    },
    { 
      name: 'South Elevation',
      elements: [
        'ground_level',
        'floor_levels',
        'overall_height',
        'roof_details',
        'openings'
        // Missing 'external_features'
      ]
    },
    { 
      name: 'East Elevation',
      elements: [
        'ground_level',
        'floor_levels',
        'overall_height',
        'roof_details',
        'openings',
        'external_features'
      ]
    }
    // Missing 'West Elevation'
  ],
  sections: [
    {
      name: 'Section A-A',
      measurements: [
        'room_heights',
        'foundation_details',
        'floor_thickness',
        'roof_construction',
        'wall_plate_level',
        'lintel_level',
        'ceiling_level'
      ],
      constructionDetails: [
        'foundations',
        'walls',
        'floors',
        'roof'
      ]
    }
  ],
  windowSchedule: {
    columns: [
      'Window reference number/code',
      'Window type (casement, sliding, fixed, etc.)',
      'Window dimensions (width × height)',
      'Window material (aluminum, wood, uPVC, etc.)',
      'Glazing type (single, double, triple)',
      'Opening mechanism',
      'Quantity'
      // Missing 'Location reference'
    ]
  },
  doorSchedule: {
    columns: [
      'Door reference number/code',
      'Door type (single, double, sliding, etc.)',
      'Door dimensions (width × height)',
      'Door material (wood, metal, glass, etc.)',
      'Fire rating (if applicable)',
      'Quantity',
      'Location reference'
    ]
  },
  ironmongerySchedule: {
    columns: [
      'Item reference number/code',
      'Item description (handle, lock, hinge, etc.)',
      'Material and finish',
      'Manufacturer/supplier',
      'Quantity',
      'Location/door reference'
    ]
  }
};

// Run the validation
const complianceReport = validateBuildingPlan(samplePlanData);

// Display the results
console.log('Building Plan Compliance Report:');
console.log(`Overall Compliance: ${complianceReport.overallCompliance}%`);
console.log('\nSection Compliance:');
Object.entries(complianceReport.sectionCompliance).forEach(([section, percentage]) => {
  console.log(`${section}: ${percentage.toFixed(2)}%`);
});

console.log(`\nTotal Checks: ${complianceReport.totalChecks}`);
console.log(`Passed Checks: ${complianceReport.passedChecks}`);
console.log(`Failed Checks: ${complianceReport.failedChecks}`);

console.log('\nFailed Checks:');
complianceReport.failedCheckDetails.forEach(failure => {
  console.log(`- ${failure.section} > ${failure.checkName}: ${failure.details}`);
});

export default validateBuildingPlan;
