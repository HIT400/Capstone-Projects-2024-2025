'use client';

import React from 'react';
import { FaCheck, FaFileAlt, FaClipboardCheck, FaCreditCard, FaCalendarCheck, FaTools, FaCertificate } from 'react-icons/fa';

// Define the stages of the application process
const applicationStages = [
  {
    id: 'application',
    title: 'Application',
    description: 'Submit your building plan application',
    icon: FaFileAlt,
  },
  {
    id: 'document-verification',
    title: 'Approval & Documents',
    description: 'Make approval payments and upload documents for verification',
    icon: FaClipboardCheck,
  },
  {
    id: 'stage-payments',
    title: 'Stage Payments',
    description: 'Pay the required stage fees',
    icon: FaCreditCard,
  },
  {
    id: 'inspection-scheduling',
    title: 'Inspection Scheduling',
    description: 'Schedule inspections with available inspectors',
    icon: FaCalendarCheck,
  },
  {
    id: 'inspections',
    title: 'Inspection Stages',
    description: 'On-site inspections of the building',
    icon: FaTools,
    subStages: [
      { id: 'siting-foundations', title: 'Siting & Foundations' },
      { id: 'dpc-lintel-wallplate', title: 'DPC/Lintel/Wall Plate' },
      { id: 'roof-trusses', title: 'Roof Trusses' },
      { id: 'drain-open-test', title: 'Drain Open Test' },
      { id: 'final-test', title: 'Final Test' }
    ]
  },
  {
    id: 'certificate',
    title: 'Certificate',
    description: 'Receive your building approval certificate',
    icon: FaCertificate,
  },
];

interface ApplicationFlowCardsProps {
  currentStage: string;
  completedStages: string[];
  activeSubStage?: string;
  completedSubStages?: string[];
  onClick?: (stageId: string) => void;
}

const ApplicationFlowCards: React.FC<ApplicationFlowCardsProps> = ({
  currentStage,
  completedStages,
  activeSubStage,
  completedSubStages = [],
  onClick
}) => {
  // Determine the status of a stage
  const getStageStatus = (stageId: string) => {
    if (completedStages?.includes(stageId)) return 'completed';
    if (currentStage === stageId) return 'current';
    return 'pending';
  };

  // Determine the status of a sub-stage
  const getSubStageStatus = (subStageId: string) => {
    if (completedSubStages?.includes(subStageId)) return 'completed';
    if (activeSubStage === subStageId) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full">
      {/* Main flow cards - horizontal progress indicator */}
      <div className="relative flex items-center justify-between mb-6">
        {/* Progress bar connecting all steps */}
        <div className="absolute left-0 right-0 h-1 bg-gray-200 z-0">
          {/* Colored progress bar for completed steps */}
          <div
            className="absolute left-0 h-full bg-green-600 transition-all duration-300"
            style={{
              width: `${Math.max(0, (completedStages?.length || 0) / (applicationStages.length - 1)) * 100}%`
            }}
          ></div>
        </div>

        {/* Steps */}
        {applicationStages.map((stage, index) => {
          const status = getStageStatus(stage.id);

          return (
            <div
              key={stage.id}
              className="z-10 flex flex-col items-center"
              onClick={() => onClick && onClick(stage.id)}
            >
              {/* Step circle */}
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 cursor-pointer
                  ${status === 'completed' ? 'bg-green-600 text-white' :
                    status === 'current' ? 'bg-blue-700 text-white' :
                    'bg-white border-2 border-gray-300 text-gray-500'}
                `}
              >
                {status === 'completed' ?
                  <FaCheck className="text-lg" /> :
                  <span className="text-sm font-bold">{index + 1}</span>
                }
              </div>

              {/* Step title */}
              <span
                className={`
                  text-xs font-medium text-center max-w-[80px] truncate
                  ${status === 'completed' ? 'text-green-600' :
                    status === 'current' ? 'text-blue-700' :
                    'text-gray-500'}
                `}
              >
                {stage.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Sub-stages for inspections if current stage is inspections */}
      {currentStage === 'inspections' && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Inspection Stages</h3>
          <div className="relative flex items-center justify-between">
            {/* Progress bar connecting all sub-steps */}
            <div className="absolute left-0 right-0 h-1 bg-gray-200 z-0">
              {/* Colored progress bar for completed sub-steps */}
              <div
                className="absolute left-0 h-full bg-green-600 transition-all duration-300"
                style={{
                  width: `${Math.max(0, (completedSubStages?.length || 0) / 5) * 100}%`
                }}
              ></div>
            </div>

            {/* Sub-steps */}
            {applicationStages.find(s => s.id === 'inspections')?.subStages?.map((subStage, index) => {
              const subStatus = getSubStageStatus(subStage.id);

              return (
                <div
                  key={subStage.id}
                  className="z-10 flex flex-col items-center"
                >
                  {/* Sub-step circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center mb-2
                      ${subStatus === 'completed' ? 'bg-green-600 text-white' :
                        subStatus === 'current' ? 'bg-blue-700 text-white' :
                        'bg-white border-2 border-gray-300 text-gray-500'}
                    `}
                  >
                    {subStatus === 'completed' ?
                      <FaCheck className="text-sm" /> :
                      <span className="text-xs font-bold">{index + 1}</span>
                    }
                  </div>

                  {/* Sub-step title */}
                  <span
                    className={`
                      text-xs font-medium text-center max-w-[70px] truncate
                      ${subStatus === 'completed' ? 'text-green-600' :
                        subStatus === 'current' ? 'text-blue-700' :
                        'text-gray-500'}
                    `}
                  >
                    {subStage.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationFlowCards;
