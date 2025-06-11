'use client';

import React from 'react';
import Link from 'next/link';
import { FaCheck, FaHourglassHalf, FaFileAlt, FaClipboardCheck, FaCreditCard, FaCalendarCheck, FaTools, FaCertificate, FaArrowRight } from 'react-icons/fa';

// Define the stages of the application process
const applicationStages = [
  {
    id: 'application',
    title: 'Application',
    icon: FaFileAlt,
    href: '/applicant/application-form'
  },
  {
    id: 'document-verification',
    title: 'Approval & Documents',
    icon: FaClipboardCheck,
    href: '/applicant/document-verification'
  },
  {
    id: 'stage-payments',
    title: 'Stage Payments',
    icon: FaCreditCard,
    href: '/applicant/stage-payments'
  },
  {
    id: 'inspection-scheduling',
    title: 'Inspection Scheduling',
    icon: FaCalendarCheck,
    href: '/applicant/inspection-scheduling'
  },
  {
    id: 'inspections',
    title: 'Inspection Stages',
    icon: FaTools,
    href: '/applicant/inspection-stages'
  },
  {
    id: 'certificate',
    title: 'Certificate',
    icon: FaCertificate,
    href: '/applicant/certificate'
  },
];

interface ApplicationStatusFlowProps {
  currentStage: string;
  applicationId?: string;
}

const ApplicationStatusFlow: React.FC<ApplicationStatusFlowProps> = ({
  currentStage,
  applicationId
}) => {
  // Find the current stage index
  const currentStageIndex = applicationStages.findIndex(stage => stage.id === currentStage);

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold text-[#224057] mb-4">Application Progress</h2>

      <div className="flex flex-nowrap overflow-x-auto pb-2">
        {applicationStages.map((stage, index) => {
          // Determine stage status
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isPending = index > currentStageIndex;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage card */}
              <Link
                href={stage.href}
                className={`
                  flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-lg mx-1
                  ${isCompleted ? 'bg-green-100 text-green-700' :
                    isCurrent ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400' :
                    'bg-gray-100 text-gray-400'}
                  transition-all hover:shadow-md
                `}
              >
                <div className="text-xl mb-1">
                  {isCompleted ? <FaCheck /> : <stage.icon />}
                </div>
                <span className="text-xs text-center font-medium">{stage.title}</span>
              </Link>

              {/* Connector arrow */}
              {index < applicationStages.length - 1 && (
                <div className="flex items-center mx-1">
                  <FaArrowRight className={`
                    ${isCompleted ? 'text-green-500' : 'text-gray-300'}
                  `} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Current stage description */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-1">
          Current Stage: <span className="text-blue-600">{applicationStages[currentStageIndex]?.title || 'Unknown'}</span>
        </h3>
        <p className="text-sm text-gray-600">
          {currentStage === 'application' && 'Complete your application form with all required details.'}
          {currentStage === 'document-verification' && 'Make approval payments and upload documents for compliance verification.'}
          {currentStage === 'stage-payments' && 'Make the required stage payments to proceed with your application.'}
          {currentStage === 'inspection-scheduling' && 'Schedule inspections with available inspectors.'}
          {currentStage === 'inspections' && 'Your building is undergoing the required inspection stages.'}
          {currentStage === 'certificate' && 'Your certificate is ready for collection.'}
        </p>

        {/* Action button */}
        <Link
          href={applicationStages[currentStageIndex]?.href || '#'}
          className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          {currentStage === 'application' && 'Continue Application'}
          {currentStage === 'document-verification' && 'Approval & Documents'}
          {currentStage === 'stage-payments' && 'Make Stage Payments'}
          {currentStage === 'inspection-scheduling' && 'Schedule Inspection'}
          {currentStage === 'inspections' && 'View Inspection Stages'}
          {currentStage === 'certificate' && 'View Certificate'}
        </Link>
      </div>
    </div>
  );
};

export default ApplicationStatusFlow;
