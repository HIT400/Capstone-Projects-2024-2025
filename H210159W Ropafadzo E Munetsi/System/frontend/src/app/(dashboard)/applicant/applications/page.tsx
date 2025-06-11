'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/Dashboardlayout';
import Link from 'next/link';
import { getNextStageUrl, getStageUrl, isStageCompleted, applicationFlowStages, getNextStage, stageDisplayNames } from '@/utils/applicationFlow';
import { del } from '@/utils/api';

interface Application {
  id: string;
  stand_number: string;
  project_description: string;
  status: string;
  created_at: string;
  updated_at: string;
  current_stage_name?: string;
  current_stage_order?: number;
  completed_requirements?: number;
  total_requirements?: number;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await axios.get(
          'http://localhost:5001/api/application-stages/user/applications',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setApplications(response.data.data);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError('Failed to load applications. Please try again later.');
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  // Get status color based on status
  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';

    if (statusLower.includes('review') || statusLower === 'pending') {
      return 'bg-yellow-50 text-yellow-600';
    } else if (statusLower.includes('approved') || statusLower === 'completed') {
      return 'bg-green-50 text-green-800';
    } else if (statusLower.includes('rejected') || statusLower === 'cancelled') {
      return 'bg-red-50 text-red-600';
    } else if (statusLower.includes('document') || statusLower.includes('verification')) {
      return 'bg-blue-50 text-blue-600';
    } else if (statusLower.includes('payment')) {
      return 'bg-purple-50 text-purple-600';
    } else if (statusLower.includes('inspection')) {
      return 'bg-indigo-50 text-indigo-600';
    } else {
      return 'bg-gray-50 text-gray-600';
    }
  };

  // Calculate progress percentage
  const calculateProgress = (completed?: number, total?: number) => {
    if (!completed || !total || total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Helper function to determine if a stage is current
  const isCurrentStage = (application: Application, stageName: string) => {
    if (!application.status || !application.current_stage_name) {
      return stageName === 'application';
    }

    // Map the stage name to our application flow stages
    let mappedStageName = '';
    switch (stageName) {
      case 'application':
        mappedStageName = 'application';
        break;
      case 'document':
        mappedStageName = 'document-verification';
        break;
      case 'payment':
        mappedStageName = 'stage-payments';
        break;
      case 'inspection':
        // This could be any of the inspection stages
        if (application.current_stage_name.toLowerCase().includes('scheduling')) {
          mappedStageName = 'inspection-scheduling';
        } else {
          mappedStageName = 'inspections';
        }
        break;
      default:
        mappedStageName = stageName;
    }

    // Map the current stage name to our application flow stages
    const currentStageLower = application.current_stage_name.toLowerCase();
    let currentMappedStage = '';

    if (currentStageLower.includes('document') || currentStageLower.includes('verification')) {
      currentMappedStage = 'document-verification';
    } else if (currentStageLower.includes('stage payment') || currentStageLower.includes('stage-payment')) {
      currentMappedStage = 'stage-payments';
    } else if (currentStageLower.includes('payment')) {
      // For backward compatibility with older data
      currentMappedStage = 'stage-payments';
    } else if (currentStageLower.includes('inspection scheduling')) {
      currentMappedStage = 'inspection-scheduling';
    } else if (currentStageLower.includes('inspection')) {
      currentMappedStage = 'inspections';
    } else if (currentStageLower.includes('certificate')) {
      currentMappedStage = 'certificate';
    } else if (currentStageLower.includes('application') || currentStageLower.includes('submission')) {
      currentMappedStage = 'application';
    } else {
      // Default to document verification for any unknown stage
      currentMappedStage = 'document-verification';
    }

    // Get the index of the mapped stage and current mapped stage in the application flow
    const mappedStageIndex = applicationFlowStages.indexOf(mappedStageName);
    const currentMappedStageIndex = applicationFlowStages.indexOf(currentMappedStage);

    // A stage is current if:
    // 1. It matches the current stage exactly, OR
    // 2. All previous stages are completed, this stage is not completed, and no later stage is current

    // Check if this stage matches the current stage
    if (mappedStageName === currentMappedStage) {
      return true;
    }

    // Check if this stage is the next incomplete stage
    if (mappedStageIndex > currentMappedStageIndex) {
      // This stage comes after the current stage, so it's not current
      return false;
    }

    // Check if this stage is completed
    const isThisStageCompleted = isStageCompleted(mappedStageName, application.status);

    // If this stage is not completed and all previous stages are completed, it's current
    if (!isThisStageCompleted) {
      // Check if all previous stages are completed
      let allPreviousStagesCompleted = true;
      for (let i = 0; i < mappedStageIndex; i++) {
        if (!isStageCompleted(applicationFlowStages[i], application.status)) {
          allPreviousStagesCompleted = false;
          break;
        }
      }

      // If all previous stages are completed and no later stage is current, this stage is current
      if (allPreviousStagesCompleted) {
        // Check if any later stage is current (has the current stage name)
        for (let i = mappedStageIndex + 1; i < applicationFlowStages.length; i++) {
          if (applicationFlowStages[i] === currentMappedStage) {
            return false;
          }
        }

        return true;
      }
    }

    return false;
  };

  // Helper function to determine if a stage is completed
  const isApplicationStageCompleted = (application: Application, stageName: string) => {
    if (!application.status) return false;

    // Map the stage name to our application flow stages
    let mappedStageName = '';
    switch (stageName) {
      case 'application':
        mappedStageName = 'application';
        break;
      case 'document':
        mappedStageName = 'document-verification';
        break;
      case 'payment':
        mappedStageName = 'stage-payments';
        break;
      case 'inspection':
        // For the visual flow, we consider inspection as a single stage
        // Check if any inspection stage is completed
        return isStageCompleted('inspection-scheduling', application.status) ||
               isStageCompleted('inspections', application.status);
      default:
        mappedStageName = stageName;
    }

    // Use the utility function to check if the stage is completed
    return isStageCompleted(mappedStageName, application.status);
  };

  // Get CSS classes for the current stage text in the flow visualization
  const getCurrentStageClass = (application: Application, stageName: string) => {
    // Map the stage name to our application flow stages
    let mappedStageName = '';
    switch (stageName) {
      case 'application':
        mappedStageName = 'application';
        break;
      case 'document':
        mappedStageName = 'document-verification';
        break;
      case 'payment':
        mappedStageName = 'stage-payments';
        break;
      case 'inspection':
        // This could be any of the inspection stages
        if (application.current_stage_name?.toLowerCase().includes('scheduling')) {
          mappedStageName = 'inspection-scheduling';
        } else {
          mappedStageName = 'inspections';
        }
        break;
      case 'certificate':
        mappedStageName = 'certificate';
        break;
      default:
        mappedStageName = stageName;
    }

    if (isCurrentStage(application, stageName)) {
      return 'text-blue-600 font-medium';
    } else if (isApplicationStageCompleted(application, stageName)) {
      return 'text-green-600 font-medium';
    } else {
      return 'text-gray-500';
    }
  };

  // Get CSS classes for the stage circle
  const getStageCircleClass = (application: Application, stageName: string) => {
    // Map the stage name to our application flow stages
    let mappedStageName = '';
    switch (stageName) {
      case 'application':
        mappedStageName = 'application';
        break;
      case 'document':
        mappedStageName = 'document-verification';
        break;
      case 'payment':
        mappedStageName = 'stage-payments';
        break;
      case 'inspection':
        // This could be any of the inspection stages
        if (application.current_stage_name?.toLowerCase().includes('scheduling')) {
          mappedStageName = 'inspection-scheduling';
        } else {
          mappedStageName = 'inspections';
        }
        break;
      case 'certificate':
        mappedStageName = 'certificate';
        break;
      default:
        mappedStageName = stageName;
    }

    if (isCurrentStage(application, stageName)) {
      return 'bg-blue-100 text-blue-600 border border-blue-600';
    } else if (isApplicationStageCompleted(application, stageName)) {
      return 'bg-green-100 text-green-600 border border-green-600';
    } else {
      return 'bg-gray-100 text-gray-500 border border-gray-300';
    }
  };

  // Get CSS classes for the connecting line between stages
  const getStageLineClass = (application: Application, fromStage: string, toStage: string) => {
    // Map the stage names to our application flow stages
    let mappedFromStage = '';
    let mappedToStage = '';

    // Map fromStage
    switch (fromStage) {
      case 'application':
        mappedFromStage = 'application';
        break;
      case 'document':
        mappedFromStage = 'document-verification';
        break;
      case 'payment':
        mappedFromStage = 'stage-payments';
        break;
      case 'inspection':
        // This could be any of the inspection stages
        if (application.current_stage_name?.toLowerCase().includes('scheduling')) {
          mappedFromStage = 'inspection-scheduling';
        } else {
          mappedFromStage = 'inspections';
        }
        break;
      case 'certificate':
        mappedFromStage = 'certificate';
        break;
      default:
        mappedFromStage = fromStage;
    }

    // Map toStage
    switch (toStage) {
      case 'application':
        mappedToStage = 'application';
        break;
      case 'document':
        mappedToStage = 'document-verification';
        break;
      case 'payment':
        mappedToStage = 'stage-payments';
        break;
      case 'inspection':
        // This could be any of the inspection stages
        if (application.current_stage_name?.toLowerCase().includes('scheduling')) {
          mappedToStage = 'inspection-scheduling';
        } else {
          mappedToStage = 'inspections';
        }
        break;
      case 'certificate':
        mappedToStage = 'certificate';
        break;
      default:
        mappedToStage = toStage;
    }

    if (isApplicationStageCompleted(application, fromStage) && isApplicationStageCompleted(application, toStage)) {
      return 'bg-green-500';
    } else if (isApplicationStageCompleted(application, fromStage) && isCurrentStage(application, toStage)) {
      return 'bg-blue-500';
    } else {
      return 'bg-gray-300';
    }
  };

  // Get the URL for continuing from the current stage
  const getContinueUrl = (application: Application) => {
    // For all applications with a status (which means they've been submitted),
    // never return to the application form to prevent duplicates
    if (application.status) {
      // If there's no current stage name, default to document verification
      if (!application.current_stage_name) return '/applicant/document-verification';

      const stageName = application.current_stage_name.toLowerCase();

      // Map the current stage name to our application flow stages
      let currentStage = '';

      if (stageName.includes('document') || stageName.includes('verification') || stageName.includes('approval')) {
        currentStage = 'document-verification';
      } else if (stageName.includes('stage payment') || stageName.includes('stage-payment')) {
        currentStage = 'stage-payments';
      } else if (stageName.includes('payment')) {
        // For backward compatibility with older data
        currentStage = 'stage-payments';
      } else if (stageName.includes('inspection scheduling')) {
        currentStage = 'inspection-scheduling';
      } else if (stageName.includes('inspection')) {
        currentStage = 'inspections';
      } else if (stageName.includes('certificate')) {
        currentStage = 'certificate';
      } else {
        // Default to document verification for any application that has a status
        currentStage = 'document-verification';
      }

      // Check if the current stage is completed
      const isCurrentStageCompleted = isStageCompleted(currentStage, application.status);

      // If the current stage is completed, move to the next stage
      if (isCurrentStageCompleted) {
        const nextStageUrl = getNextStageUrl(currentStage);
        if (nextStageUrl) {
          return nextStageUrl;
        }
      }

      // If the current stage is not completed or there's no next stage, stay on the current stage
      return getStageUrl(currentStage);
    } else {
      // Only for applications with no status (which should be rare),
      // allow starting from the application form
      return '/applicant/application-form';
    }
  };

  // Handle opening the delete confirmation modal
  const handleOpenDeleteConfirm = (applicationId: string) => {
    setApplicationToDelete(applicationId);
    setDeleteConfirmOpen(true);
  };

  // Handle closing the delete confirmation modal
  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setApplicationToDelete(null);
  };

  // Handle deleting an application
  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    try {
      setIsDeleting(true);

      // Call the API to delete the application
      const response = await del(`applications/${applicationToDelete}`);

      // Remove the application from the state
      setApplications(applications.filter(app => app.id !== applicationToDelete));

      // Close the modal
      setDeleteConfirmOpen(false);
      setApplicationToDelete(null);

      // Show success message
      toast.success('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout userRole="applicant">
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-[#224057]">My Applications</h1>
                <p className="text-gray-600 mt-1">
                  View and manage your building plan applications
                </p>
              </div>
              <div className="relative group">
                <Link
                  href="/applicant/application-form"
                  className="px-4 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Application
                </Link>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-3 text-xs text-gray-600 hidden group-hover:block z-10">
                  <p className="flex items-start">
                    <svg className="w-4 h-4 text-amber-500 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Only create a new application if you don't have an existing one in progress.
                  </p>
                </div>
              </div>
            </div>

            {/* Application Process Workflow */}
            <div className="bg-white rounded-lg p-4 mt-4 shadow-sm">
              <h3 className="text-sm font-medium text-[#224057] mb-2">Application Process Workflow</h3>
              <div className="flex flex-wrap items-center justify-between text-xs">
                <div className="flex flex-col items-center text-blue-600 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-blue-100 border border-blue-600">1</div>
                  <span>Application</span>
                </div>
                <div className="hidden sm:block h-0.5 flex-1 bg-gray-300 mx-1"></div>
                <div className="flex flex-col items-center text-gray-600 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gray-100 border border-gray-300">2</div>
                  <span className="text-center">Approval & Documents</span>
                </div>
                <div className="hidden sm:block h-0.5 flex-1 bg-gray-300 mx-1"></div>
                <div className="flex flex-col items-center text-gray-600 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gray-100 border border-gray-300">3</div>
                  <span>Stage Payments</span>
                </div>
                <div className="hidden sm:block h-0.5 flex-1 bg-gray-300 mx-1"></div>
                <div className="flex flex-col items-center text-gray-600 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gray-100 border border-gray-300">4</div>
                  <span>Inspection</span>
                </div>
                <div className="hidden sm:block h-0.5 flex-1 bg-gray-300 mx-1"></div>
                <div className="flex flex-col items-center text-gray-600 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-gray-100 border border-gray-300">5</div>
                  <span>Certificate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Applications Found</h2>
              <p className="text-gray-500 mb-6">You haven't submitted any applications yet.</p>
              <Link
                href="/applicant/application-form"
                className="px-4 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] transition-colors"
              >
                Create Your First Application
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:border-[#224057] transition-colors">
                  <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-[#224057]">
                        {app.project_description || `Application for Stand ${app.stand_number}`}
                      </h2>
                      <span className={`px-3 py-1 ${getStatusColor(app.status)} text-xs font-medium rounded-full`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left Column - Application Details */}
                      <div className="flex-1">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase">Application ID</h3>
                            <p className="text-sm font-medium text-gray-800">{app.id}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase">Stand Number</h3>
                            <p className="text-sm font-medium text-gray-800">{app.stand_number}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase">Submitted</h3>
                            <p className="text-sm text-gray-800">{formatDate(app.created_at)}</p>
                          </div>
                          <div>
                            <h3 className="text-xs font-medium text-gray-500 uppercase">Last Updated</h3>
                            <p className="text-sm text-gray-800">{formatDate(app.updated_at)}</p>
                          </div>
                        </div>

                        {/* Current Stage */}
                        <div className="mt-6">
                          <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">Current Stage</h3>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${app.status === 'approved' ? 'bg-green-500' : app.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'} mr-2`}></div>
                            <p className="text-base font-semibold text-[#224057]">
                              {(() => {
                                // If there's a current stage name, use it
                                if (app.current_stage_name) {
                                  return app.current_stage_name;
                                }

                                // If there's no current stage name but the status is approved,
                                // determine the appropriate stage based on the status
                                if (app.status) {
                                  const status = app.status.toLowerCase();

                                  if (status.includes('approved') || status === 'approved') {
                                    // For approved status, the next stage is typically stage payments
                                    return 'Stage Payments';
                                  } else if (status.includes('paid') || status === 'paid') {
                                    // For paid status, the next stage is typically inspection scheduling
                                    return 'Inspection Scheduling';
                                  } else if (status.includes('inspection scheduling')) {
                                    // For inspection scheduling status
                                    return 'Inspection Scheduling';
                                  } else if (status.includes('inspection')) {
                                    // For inspection-related status, the stage is inspection
                                    return 'Inspection Stages';
                                  }
                                }

                                // Default to 'Not started' if no other condition is met
                                return 'Not started';
                              })()}
                            </p>
                          </div>

                          {app.status && ['pending', 'in_review', 'approved', 'completed'].includes(app.status.toLowerCase()) && (
                            <p className="text-xs text-amber-600 mt-2 flex items-start">
                              <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Application already submitted. Continue from current stage.</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Column - Progress and Actions */}
                      <div className="flex-1">
                        {/* Application Flow Visualization */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h3 className="text-xs font-medium text-gray-500 uppercase mb-3">Application Progress</h3>

                          <div className="flex items-center justify-between text-xs mb-4">
                            <div className={`flex flex-col items-center ${getCurrentStageClass(app, 'application')}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${getStageCircleClass(app, 'application')}`}>1</div>
                              <span>Application</span>
                            </div>
                            <div className={`h-0.5 flex-1 ${getStageLineClass(app, 'application', 'document')} mx-1`}></div>
                            <div className={`flex flex-col items-center ${getCurrentStageClass(app, 'document')}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${getStageCircleClass(app, 'document')}`}>2</div>
                              <span className="text-center">Approval & Documents</span>
                            </div>
                            <div className={`h-0.5 flex-1 ${getStageLineClass(app, 'document', 'payment')} mx-1`}></div>
                            <div className={`flex flex-col items-center ${getCurrentStageClass(app, 'payment')}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${getStageCircleClass(app, 'payment')}`}>3</div>
                              <span>Stage Payments</span>
                            </div>
                            <div className={`h-0.5 flex-1 ${getStageLineClass(app, 'payment', 'inspection')} mx-1`}></div>
                            <div className={`flex flex-col items-center ${getCurrentStageClass(app, 'inspection')}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${getStageCircleClass(app, 'inspection')}`}>4</div>
                              <span>Inspection</span>
                            </div>
                            <div className={`h-0.5 flex-1 ${getStageLineClass(app, 'inspection', 'certificate')} mx-1`}></div>
                            <div className={`flex flex-col items-center ${getCurrentStageClass(app, 'certificate')}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${getStageCircleClass(app, 'certificate')}`}>5</div>
                              <span>Certificate</span>
                            </div>
                          </div>

                          {app.completed_requirements !== undefined && app.total_requirements !== undefined && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Stage Progress</span>
                                <span>{app.completed_requirements} of {app.total_requirements} requirements completed</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="bg-blue-600 h-2.5 rounded-full"
                                  style={{ width: `${calculateProgress(app.completed_requirements, app.total_requirements)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => router.push(getContinueUrl(app))}
                            className="w-full py-3 px-4 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] transition-colors flex items-center justify-center"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            {(() => {
                              // Use the same logic as getContinueUrl to determine the button text
                              if (!app.status) {
                                return 'Start New Application';
                              }

                              // If there's no current stage name, default to document verification
                              if (!app.current_stage_name) {
                                return 'Continue to Document Verification';
                              }

                              const stageName = app.current_stage_name.toLowerCase();

                              // Map the current stage name to our application flow stages
                              let currentStage = '';

                              if (stageName.includes('document') || stageName.includes('verification') || stageName.includes('approval')) {
                                currentStage = 'document-verification';
                              } else if (stageName.includes('stage payment') || stageName.includes('stage-payment')) {
                                currentStage = 'stage-payments';
                              } else if (stageName.includes('payment')) {
                                // For backward compatibility with older data
                                currentStage = 'stage-payments';
                              } else if (stageName.includes('inspection scheduling')) {
                                currentStage = 'inspection-scheduling';
                              } else if (stageName.includes('inspection')) {
                                currentStage = 'inspections';
                              } else if (stageName.includes('certificate')) {
                                currentStage = 'certificate';
                              } else {
                                // Default to document verification for any application that has a status
                                currentStage = 'document-verification';
                              }

                              // Check if the current stage is completed using the utility function
                              const isCurrentStageCompleted = isStageCompleted(currentStage, app.status);

                              // If the current stage is completed, show the next stage
                              if (isCurrentStageCompleted) {
                                const nextStage = getNextStage(currentStage);
                                if (nextStage) {
                                  // Use the display name from the utility
                                  const displayName = stageDisplayNames[nextStage] ||
                                    nextStage.split('-')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                      .join(' ');
                                  return `Continue to ${displayName}`;
                                }
                              }

                              // If the current stage is not completed or there's no next stage,
                              // use the display name from the utility
                              const currentDisplayName = stageDisplayNames[currentStage] ||
                                currentStage.split('-')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ');

                              return `Continue to ${currentDisplayName}`;
                            })()}
                          </button>

                          {/* Delete Application Button */}
                          <button
                            onClick={() => handleOpenDeleteConfirm(app.id)}
                            className="w-full py-2 px-4 bg-white border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center text-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Application
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Application</h3>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this application? This action cannot be undone.
                <br /><br />
                <span className="text-red-500 font-medium">
                  If you are no longer satisfied with this application, deleting it will allow you to start fresh.
                </span>
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteConfirm}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteApplication}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Application
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
