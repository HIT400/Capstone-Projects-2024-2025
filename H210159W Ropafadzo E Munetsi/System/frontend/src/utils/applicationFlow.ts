// Define the application flow stages in order
export const applicationFlowStages = [
  'application',
  'document-verification', // This includes approval payments
  'stage-payments',
  'inspection-scheduling',
  'inspections',
  'certificate'
];

// Define display names for each stage
export const stageDisplayNames = {
  'application': 'Application',
  'document-verification': 'Approval Payments & Document Verification',
  'stage-payments': 'Stage Payments',
  'inspection-scheduling': 'Inspection Scheduling',
  'inspections': 'Inspection Stages',
  'certificate': 'Certificate'
};

// Get the URL path for a stage
export const getStageUrl = (stage: string): string => {
  switch (stage) {
    case 'application':
      return '/applicant/application-form';
    case 'document-verification':
      return '/applicant/document-verification';
    case 'stage-payments':
      return '/applicant/stage-payments';
    case 'inspection-scheduling':
      return '/applicant/inspection-scheduling';
    case 'inspections':
      return '/applicant/inspection-stages';
    case 'certificate':
      return '/applicant/certificate';
    default:
      return '/applicant';
  }
};

// Get the next stage in the flow
export const getNextStage = (currentStage: string): string | null => {
  const currentIndex = applicationFlowStages.indexOf(currentStage);

  // If current stage is not found or is the last stage, return null
  if (currentIndex === -1 || currentIndex === applicationFlowStages.length - 1) {
    return null;
  }

  // Return the next stage
  return applicationFlowStages[currentIndex + 1];
};

// Get the next stage URL
export const getNextStageUrl = (currentStage: string): string | null => {
  const nextStage = getNextStage(currentStage);
  if (!nextStage) return null;

  return getStageUrl(nextStage);
};

// Check if a stage is completed based on application status
export const isStageCompleted = (stage: string, applicationStatus: string): boolean => {
  if (!applicationStatus) return false;

  const status = applicationStatus.toLowerCase();

  switch (stage) {
    case 'application':
      // Application is completed if it's not in draft or pending state
      return status !== 'draft' && status !== 'pending';

    case 'document-verification':
      // Document verification is completed if the status indicates document approval
      return status.includes('approved') ||
             status.includes('paid') ||
             status.includes('completed') ||
             status.includes('inspection');

    case 'stage-payments':
      // Stage payments is completed if the status indicates payment or later stages
      return status.includes('paid') ||
             status.includes('completed') ||
             status.includes('inspection');

    case 'inspection-scheduling':
      // Inspection scheduling is completed if inspections are scheduled or completed
      return status.includes('inspection scheduled') ||
             status.includes('inspection completed') ||
             status.includes('certificate');

    case 'inspections':
      // Inspections are completed if all inspections are done
      return status.includes('inspection completed') ||
             status.includes('certificate');

    case 'certificate':
      // Certificate stage is completed if the application is completed
      return status.includes('completed') ||
             status.includes('certificate issued');

    default:
      return false;
  }
};
