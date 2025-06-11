'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import DashboardLayout from '@/components/Dashboardlayout';
import ApplicationFlowCards from '@/components/ApplicationFlowCards';
import { useAuth } from '@/context/AuthContext';
import { get } from '@/utils/api';
import toast from '@/utils/toast';

interface ApplicationProcessLayoutProps {
  children: ReactNode;
}

const ApplicationProcessLayout: React.FC<ApplicationProcessLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [currentStage, setCurrentStage] = useState('application');
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [activeSubStage, setActiveSubStage] = useState<string | undefined>(undefined);
  const [completedSubStages, setCompletedSubStages] = useState<string[]>([]);
  const [applicationId, setApplicationId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  // Determine current stage based on the current path and reset fetch state
  useEffect(() => {
    // Reset the fetch state when pathname changes to ensure we get fresh data
    setHasFetchedData(false);

    if (pathname.includes('/application-form')) {
      setCurrentStage('application');
    } else if (pathname.includes('/document-verification')) {
      setCurrentStage('document-verification');
    } else if (pathname.includes('/stage-payments')) {
      setCurrentStage('stage-payments');
    } else if (pathname.includes('/payments')) {
      setCurrentStage('payment');
    } else if (pathname.includes('/inspection-scheduling')) {
      setCurrentStage('inspection-scheduling');
    } else if (pathname.includes('/inspection-stages')) {
      setCurrentStage('inspections');
    } else if (pathname.includes('/certificate')) {
      setCurrentStage('certificate');
    }
  }, [pathname]);

  // Listen for application status updates from payment and inspection pages
  useEffect(() => {
    const handleApplicationStatusUpdate = (event: Event) => {
      // Reset the fetch state to trigger a refresh of the application status
      setHasFetchedData(false);

      // Handle specific event details if available
      const customEvent = event as CustomEvent;
      if (customEvent.detail) {
        // If this is a stage payment completion event
        if (customEvent.detail.paymentCompleted && customEvent.detail.paymentType === 'stage') {
          // Add stage-payments to completed stages if not already there
          setCompletedStages(prev => {
            if (!prev.includes('stage-payments')) {
              return [...prev, 'stage-payments'];
            }
            return prev;
          });
        }

        // If this is an inspection scheduling event
        if (customEvent.detail.inspectionScheduled) {
          // Add inspection-scheduling to completed stages if not already there
          setCompletedStages(prev => {
            if (!prev.includes('inspection-scheduling')) {
              return [...prev, 'inspection-scheduling'];
            }
            return prev;
          });
        }

        // If this is an inspection completion event
        if (customEvent.detail.inspectionsCompleted) {
          // Add inspections to completed stages if not already there
          setCompletedStages(prev => {
            if (!prev.includes('inspections')) {
              return [...prev, 'inspections'];
            }
            return prev;
          });
        }
      }
    };

    // Add event listener
    window.addEventListener('applicationStatusUpdated', handleApplicationStatusUpdate);

    // Clean up
    return () => {
      window.removeEventListener('applicationStatusUpdated', handleApplicationStatusUpdate);
    };
  }, []);

  // Fetch the user's most recent application to determine completed stages
  useEffect(() => {
    // Skip if we've already fetched data or if there's no user
    if (!user || hasFetchedData) {
      setLoading(false);
      return;
    }

    const fetchApplicationStatus = async () => {
      try {
        setLoading(true);
        const response = await get('application-stages/user/applications');

        if (response.data?.data && response.data.data.length > 0) {
          // Get the most recent application
          const latestApplication = response.data.data[0];
          setApplicationId(latestApplication.id);

          // Determine completed stages based on application status
          const status = latestApplication.status.toLowerCase();
          const completed: string[] = [];

          if (status !== 'draft' && status !== 'pending') {
            completed.push('application');
          }

          if (status !== 'draft' && status !== 'pending' && status !== 'submitted') {
            completed.push('document-verification');
          }

          if (status === 'paid' || status === 'completed') {
            completed.push('payment');
            completed.push('stage-payments');
          }

          // Check for stage payments specifically
          try {
            const stagePaymentsResponse = await get('payments/user?payment_type=stage');
            if (stagePaymentsResponse.data?.data && stagePaymentsResponse.data.data.length > 0) {
              // Check if any stage payment is completed
              const completedPayment = stagePaymentsResponse.data.data.find(
                (payment: any) => payment.payment_status === 'completed'
              );
              if (completedPayment && !completed.includes('stage-payments')) {
                completed.push('stage-payments');
              }
            }
          } catch (paymentError) {
            console.error('Error fetching stage payments:', paymentError);
          }

          // Check for inspection schedules
          try {
            // Validate application ID before making the request
            if (latestApplication.id && !isNaN(parseInt(latestApplication.id))) {
              try {
                const schedulesResponse = await get(`inspection-schedules/application/${latestApplication.id}`);
                if (schedulesResponse.data?.data && schedulesResponse.data.data.length > 0) {
                  // If there's at least one schedule, mark inspection-scheduling as completed
                  if (!completed.includes('inspection-scheduling')) {
                    completed.push('inspection-scheduling');
                  }

                  // Check if any inspection stages are completed
                  try {
                    const stagesResponse = await get(`inspection-stages/application/${latestApplication.id}`);
                    if (stagesResponse.data?.data && stagesResponse.data.data.length > 0) {
                      // If there's at least one completed stage, mark inspections as completed
                      const completedStage = stagesResponse.data.data.find(
                        (stage: any) => stage.status === 'completed' || stage.status === 'passed'
                      );
                      if (completedStage && !completed.includes('inspections')) {
                        completed.push('inspections');
                      }
                    }
                  } catch (stagesError) {
                    console.error('Error fetching inspection stages:', stagesError);
                    // Continue with the flow even if stages can't be fetched
                  }
                }
              } catch (schedulesError) {
                console.error('Error fetching inspection schedules:', schedulesError);
                // Continue with the flow even if schedules can't be fetched
              }
            } else {
              console.warn('Invalid application ID, skipping inspection schedules check');
            }
          } catch (inspectionError) {
            console.error('Error in inspection data processing:', inspectionError);
          }

          // MOCK: Check localStorage for mock application status
          try {
            const storedApplications = localStorage.getItem('mockApplications');
            if (storedApplications) {
              const applications = JSON.parse(storedApplications);
              const mockApp = applications.find((app: any) => app.id === latestApplication.id);
              if (mockApp && mockApp.status === 'paid') {
                // Add payment to completed stages if it's not already there
                if (!completed.includes('payment')) {
                  completed.push('payment');
                }
              }
            }
          } catch (error) {
            console.error('Error checking mock application status:', error);
          }

          // Check if there are any scheduled inspections
          try {
            // Validate application ID before making the request
            if (latestApplication.id && !isNaN(parseInt(latestApplication.id))) {
              try {
                const scheduleResponse = await get(`inspection-schedules/application/${latestApplication.id}`);
                if (scheduleResponse.data?.data && scheduleResponse.data.data.length > 0) {
                  completed.push('inspection-scheduling');

                  // Check for completed inspection stages
                  try {
                    const stagesResponse = await get(`inspection-stages/application/${latestApplication.id}`);
                    if (stagesResponse.data?.data && stagesResponse.data.data.length > 0) {
                      const stages = stagesResponse.data.data;
                      const completedSubs: string[] = [];
                      let activeStage: string | undefined = undefined;

                      // Process inspection stages
                      const stageMapping: Record<string, string> = {
                        'Siting and Foundations': 'siting-foundations',
                        'DPC/Lintel/Wall plate Level': 'dpc-lintel-wallplate',
                        'Roof Trusses': 'roof-trusses',
                        'Drain Open Test': 'drain-open-test',
                        'Final Test': 'final-test'
                      };

                      stages.forEach((stage: any) => {
                        const stageId = stageMapping[stage.stage_name];
                        if (stageId) {
                          if (stage.status === 'completed') {
                            completedSubs.push(stageId);
                          } else if (stage.status === 'scheduled' || stage.status === 'in_progress') {
                            activeStage = stageId;
                          }
                        }
                      });

                      setCompletedSubStages(completedSubs);
                      setActiveSubStage(activeStage);

                      // If all stages are completed, mark inspections as completed
                      if (completedSubs.length === 5) {
                        completed.push('inspections');
                      }
                    }
                  } catch (stagesError) {
                    console.error('Error fetching inspection stages:', stagesError);
                    // Continue with the flow even if stages can't be fetched
                  }
                }
              } catch (scheduleError) {
                console.error('Error fetching inspection schedules:', scheduleError);
                // Continue with the flow even if schedules can't be fetched
              }
            } else {
              console.warn('Invalid latest application ID, skipping inspection schedules check');
            }
          } catch (scheduleError) {
            console.error('Error in inspection schedules processing:', scheduleError);
          }

          if (status === 'completed') {
            completed.push('certificate');
          }

          setCompletedStages(completed);
        }
      } catch (error) {
        console.error('Error fetching application status:', error);
        toast.error('Failed to load your application status');
      } finally {
        setLoading(false);
        setHasFetchedData(true); // Mark that we've fetched data
      }
    };

    fetchApplicationStatus();
  }, [user, hasFetchedData, pathname]); // Add pathname to dependencies to refresh when route changes

  return (
    <DashboardLayout userRole="applicant">
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Application Flow Cards */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <ApplicationFlowCards
            currentStage={currentStage}
            completedStages={completedStages}
            activeSubStage={activeSubStage}
            completedSubStages={completedSubStages}
          />
        </div>

        {/* Page Content */}
        {children}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationProcessLayout;
