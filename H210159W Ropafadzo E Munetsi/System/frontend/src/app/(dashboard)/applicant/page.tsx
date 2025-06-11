//aplicant page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import UserCard from '@/components/UserCard';
import DashboardLayout from '@/components/Dashboardlayout';
import ScheduledInspections from '@/components/ScheduledInspections';
import Link from 'next/link';
import { get } from '@/utils/api';
import toast from '@/utils/toast';

interface Application {
  id: string;
  stand_number: string;
  project_description: string;
  status: string;
  created_at: string;
  current_stage_name?: string;
}

interface Counts {
  applications: number;
  inspections: number;
  payments: number;
  verifications: number;
}

const ApplicantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [counts, setCounts] = useState<Counts>({
    applications: 0,
    inspections: 0,
    payments: 0,
    verifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [countsLoading, setCountsLoading] = useState(true);
  const [error, setError] = useState('');

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown date';

    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  // Get status color based on status
  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-50 text-gray-600';

    const statusLower = status.toLowerCase();

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

  // Fetch counts for dashboard cards
  useEffect(() => {
    // Maximum number of retry attempts
    const MAX_RETRIES = 3;

    const fetchCounts = async (retryCount = 0) => {
      try {
        setCountsLoading(true);

        // Log the request for debugging
        console.log(`Fetching dashboard counts for applicant (Attempt ${retryCount + 1})`);

        try {
          // Use our API utility which has better error handling
          const applicationsPromise = get('application-stages/user/applications');
          const inspectionsPromise = get('inspection-schedules/user/applications');
          const paymentsPromise = get('payments/user');
          const documentsPromise = get('documents').catch(() => ({ data: { data: [] } })); // Default to empty array if endpoint doesn't exist

          // Wait for all promises to resolve
          const [applicationsRes, inspectionsRes, paymentsRes, documentsRes] = await Promise.all([
            applicationsPromise,
            inspectionsPromise,
            paymentsPromise,
            documentsPromise
          ]);

          // Extract counts with validation
          const applicationsCount = applicationsRes.data?.data && Array.isArray(applicationsRes.data.data)
            ? applicationsRes.data.data.length : 0;

          const inspectionsCount = inspectionsRes.data?.data && Array.isArray(inspectionsRes.data.data)
            ? inspectionsRes.data.data.length : 0;

          const paymentsCount = paymentsRes.data?.data && Array.isArray(paymentsRes.data.data)
            ? paymentsRes.data.data.length : 0;

          const verificationsCount = documentsRes.data?.data && Array.isArray(documentsRes.data.data)
            ? documentsRes.data.data.length : 0;

          console.log('Dashboard counts:', {
            applications: applicationsCount,
            inspections: inspectionsCount,
            payments: paymentsCount,
            verifications: verificationsCount
          });

          // Update counts
          setCounts({
            applications: applicationsCount,
            inspections: inspectionsCount,
            payments: paymentsCount,
            verifications: verificationsCount
          });
        } catch (apiError: any) {
          console.error(`API error fetching dashboard counts (Attempt ${retryCount + 1}):`, apiError);

          // Check if we should retry the request
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying dashboard counts fetch (${retryCount + 1}/${MAX_RETRIES})...`);

            // Wait a bit before retrying (exponential backoff)
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry the request
            return fetchCounts(retryCount + 1);
          }

          // If we've exhausted all retries, set default counts
          setCounts({
            applications: 0,
            inspections: 0,
            payments: 0,
            verifications: 0
          });
        }
      } catch (error) {
        console.error('Unexpected error fetching counts:', error);
        // Don't show error message to user, just log it
      } finally {
        setCountsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Fetch user's applications
  useEffect(() => {
    // Maximum number of retry attempts
    const MAX_RETRIES = 3;

    const fetchApplications = async (retryCount = 0) => {
      try {
        setLoading(true);

        // Log the request for debugging
        console.log(`Fetching applications for applicant dashboard (Attempt ${retryCount + 1})`);

        try {
          // Use our API utility which has better error handling
          const response = await get('application-stages/user/applications');

          // Validate response data with detailed logging
          if (response && response.data) {
            if (response.data.data) {
              // Check if data is an array
              if (Array.isArray(response.data.data)) {
                console.log(`Received ${response.data.data.length} applications`);

                // Make sure we have valid application objects
                const validApplications = response.data.data.filter(app =>
                  app && typeof app === 'object' && app !== null
                );

                if (validApplications.length > 0) {
                  setApplications(validApplications);
                } else {
                  console.warn('No valid application objects found in the response');
                  setApplications([]);
                }
              } else {
                console.warn('API returned non-array data for applications');
                setApplications([]);
              }
            } else {
              console.warn('No data property in response for applications');
              setApplications([]);
            }
          } else {
            console.warn('Invalid response format for applications');
            setApplications([]);
          }
        } catch (apiError: any) {
          console.error(`API error fetching applications (Attempt ${retryCount + 1}):`, apiError);

          // Check if we should retry the request
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying applications fetch (${retryCount + 1}/${MAX_RETRIES})...`);

            // Wait a bit before retrying (exponential backoff)
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry the request
            return fetchApplications(retryCount + 1);
          }

          // If we've exhausted all retries, set empty applications
          setApplications([]);
        }
      } catch (error) {
        console.error('Unexpected error fetching applications:', error);
        // Don't show error message to user, just log it
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);
  return (
    <DashboardLayout userRole="applicant">
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#224057]">Applicant Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your application overview</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <UserCard type="application" count={counts.applications} loading={countsLoading} />
        <UserCard type="inspection" count={counts.inspections} loading={countsLoading} />
        <UserCard type="payment" count={counts.payments} loading={countsLoading} />
        <UserCard type="document-verification" count={counts.verifications} loading={countsLoading} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#224057] mb-4">Recent Applications</h2>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#224057]"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500">No applications found.</p>
                <Link
                  href="/applicant/application-form"
                  className="mt-4 inline-block px-4 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d]"
                >
                  Create New Application
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app?.id || Math.random()} className="pb-4 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium text-gray-900">
                          {app?.project_description || 'Building Application'}
                        </h3>
                        <span className={`px-2 py-1 ${getStatusColor(app?.status)} text-xs font-medium rounded-full`}>
                          {app?.current_stage_name || app?.status || 'Unknown Status'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>ID: {app?.id ? String(app.id).substring(0, 8) : 'Unknown'} | Submitted: {formatDate(app?.created_at)}</p>
                        <p className="mt-1">Stand No: {app?.stand_number || 'Unknown'}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link href="/applicant/applications" className="mt-6 flex w-full py-2 px-4 text-center border border-[#224057] text-[#224057] font-medium rounded-lg hover:bg-[#224057] hover:text-white transition-colors items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View My Applications
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Upcoming Inspections Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#224057]">Upcoming Inspections</h2>
            </div>

            {/* Pass null for applicationId to fetch all user's inspections */}
            <ScheduledInspections applicationId={null} />
          </div>
        </div>
      </div>


    </div>
    </DashboardLayout>
  );
};

export default ApplicantDashboard;