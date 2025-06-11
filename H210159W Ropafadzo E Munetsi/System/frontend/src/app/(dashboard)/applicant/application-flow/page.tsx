'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/Dashboardlayout';
import ApplicationFlowCards from '@/components/ApplicationFlowCards';

const ApplicationFlowPage: React.FC = () => {
  // Demo state to show different stages
  const [demoStage, setDemoStage] = useState('application');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [activeSubStage, setActiveSubStage] = useState<string | undefined>(undefined);
  const [completedSubStages, setCompletedSubStages] = useState<string[]>([]);

  // Function to advance to the next stage
  const advanceStage = () => {
    const stages = ['application', 'document-verification', 'stage-payments', 'inspection-scheduling', 'inspections', 'certificate'];
    const currentIndex = stages.indexOf(demoStage);

    if (currentIndex < stages.length - 1) {
      // Add current stage to completed stages
      setCompletedStages([...completedStages, demoStage]);

      // Move to next stage
      const nextStage = stages[currentIndex + 1];
      setDemoStage(nextStage);

      // If moving to inspections, set the first sub-stage as active
      if (nextStage === 'inspections') {
        setActiveSubStage('siting-foundations');
      } else {
        setActiveSubStage(undefined);
      }
    }
  };

  // Function to advance to the next sub-stage
  const advanceSubStage = () => {
    if (demoStage !== 'inspections' || !activeSubStage) return;

    const subStages = ['siting-foundations', 'dpc-lintel-wallplate', 'roof-trusses', 'drain-open-test', 'final-test'];
    const currentIndex = subStages.indexOf(activeSubStage);

    if (currentIndex < subStages.length - 1) {
      // Add current sub-stage to completed sub-stages
      setCompletedSubStages([...completedSubStages, activeSubStage]);

      // Move to next sub-stage
      setActiveSubStage(subStages[currentIndex + 1]);
    } else {
      // All sub-stages completed, add the last one and move to next main stage
      setCompletedSubStages([...completedSubStages, activeSubStage]);
      setActiveSubStage(undefined);

      // Add inspections to completed stages
      setCompletedStages([...completedStages, demoStage]);

      // Move to certificate stage
      setDemoStage('certificate');
    }
  };

  // Reset the demo
  const resetDemo = () => {
    setDemoStage('application');
    setCompletedStages([]);
    setActiveSubStage(undefined);
    setCompletedSubStages([]);
  };

  return (
    <DashboardLayout userRole="applicant">
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#224057]">Application Flow</h1>
          <p className="text-gray-600 mt-2">
            This page demonstrates the flow of a building plan approval application from submission to completion.
          </p>
        </div>

        {/* Application Flow Cards */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-[#224057] mb-4">New Building Permit Application</h2>
          <ApplicationFlowCards
            currentStage={demoStage}
            completedStages={completedStages}
            activeSubStage={activeSubStage}
            completedSubStages={completedSubStages}
          />
        </div>

        {/* Demo Controls */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#224057] mb-4">Demo Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={advanceStage}
              disabled={demoStage === 'inspections' && activeSubStage !== undefined}
              className={`px-4 py-2 rounded-md font-medium ${
                demoStage === 'inspections' && activeSubStage !== undefined
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Advance to Next Stage
            </button>

            {demoStage === 'inspections' && activeSubStage && (
              <button
                onClick={advanceSubStage}
                className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
              >
                Complete Current Inspection
              </button>
            )}

            <button
              onClick={resetDemo}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
            >
              Reset Demo
            </button>
          </div>

          {/* Current Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium text-gray-700 mb-2">Current Status:</h3>
            <p><strong>Current Stage:</strong> {demoStage}</p>
            {activeSubStage && <p><strong>Current Sub-Stage:</strong> {activeSubStage}</p>}
            <p><strong>Completed Stages:</strong> {completedStages.length > 0 ? completedStages.join(', ') : 'None'}</p>
            <p><strong>Completed Sub-Stages:</strong> {completedSubStages.length > 0 ? completedSubStages.join(', ') : 'None'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationFlowPage;
