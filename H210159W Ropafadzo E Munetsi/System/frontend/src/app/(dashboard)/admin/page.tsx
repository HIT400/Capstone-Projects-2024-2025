// pages/admin/dashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from '@/components/Dashboardlayout';
import AdminDashboardCards from '@/components/AdminDashboardCards';
import { get } from '@/utils/api';
import Link from 'next/link';
import { FaFileAlt, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaCalendarDay, FaCheckCircle } from 'react-icons/fa';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [upcomingInspections, setUpcomingInspections] = useState<any[]>([]);
  const [completedInspections, setCompletedInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin dashboard data...');

        try {
          // Fetch recent applications
          console.log('Fetching recent applications...');
          const applicationsResponse = await get('applications');

          console.log('Applications response:', applicationsResponse);

          if (applicationsResponse.data && Array.isArray(applicationsResponse.data.data)) {
            // Sort by created_at date (newest first) and take the first 5
            const sortedApplications = [...applicationsResponse.data.data]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 5);

            console.log(`Displaying ${sortedApplications.length} recent applications`);
            setRecentApplications(sortedApplications);
          } else {
            console.warn('Invalid applications response format:', applicationsResponse);
            setRecentApplications([]);
          }
        } catch (appError) {
          console.error('Error fetching applications:', appError);
          setRecentApplications([]);
        }

        try {
          // Fetch all inspections
          console.log('Fetching inspections...');
          const inspectionsResponse = await get('inspection-schedules');

          console.log('Inspections response:', inspectionsResponse);

          if (inspectionsResponse.data && Array.isArray(inspectionsResponse.data.data)) {
            const allInspections = inspectionsResponse.data.data;

            // Filter for upcoming inspections (scheduled but not completed)
            // Sort by scheduled date (soonest first) and take the first 5
            const upcoming = allInspections
              .filter((inspection: any) =>
                inspection.status === 'scheduled' || inspection.status === 'pending'
              )
              .sort((a: any, b: any) => {
                // Handle potential missing scheduled_date
                if (!a.scheduled_date) return 1;
                if (!b.scheduled_date) return -1;
                return new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
              })
              .slice(0, 5);

            console.log(`Displaying ${upcoming.length} upcoming inspections`);
            setUpcomingInspections(upcoming);

            // Filter for completed inspections
            // Sort by completion date (most recent first) and take the first 5
            const completed = allInspections
              .filter((inspection: any) => inspection.status === 'completed')
              .sort((a: any, b: any) => {
                // Sort by updated_at or scheduled_date if available
                const dateA = a.updated_at || a.scheduled_date;
                const dateB = b.updated_at || b.scheduled_date;

                if (!dateA) return 1;
                if (!dateB) return -1;

                // Sort in descending order (newest first)
                return new Date(dateB).getTime() - new Date(dateA).getTime();
              })
              .slice(0, 5);

            console.log(`Displaying ${completed.length} completed inspections`);
            setCompletedInspections(completed);
          } else {
            console.warn('Invalid inspections response format:', inspectionsResponse);
            setUpcomingInspections([]);
            setCompletedInspections([]);
          }
        } catch (inspectionError) {
          console.error('Error fetching inspections:', inspectionError);
          setUpcomingInspections([]);
          setCompletedInspections([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout userRole="admin"> {/* Wrap with layout and specify role */}
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#224057]">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your application overview</p>
        </div>

        {/* Stats Cards Grid */}
        <AdminDashboardCards />

        {/* Main Content Area - First Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Applications Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#224057] mb-4">Recent Applications</h2>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#224057]"></div>
                </div>
              ) : recentApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No applications found
                </div>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#224057] text-white rounded-full flex items-center justify-center">
                        <FaFileAlt />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            Stand #{application.stand_number || 'N/A'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(application.status)}`}>
                            {application.status || 'Unknown'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {application.owner_name || 'Unknown Owner'}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaCalendarDay className="mr-1" />
                          <span>Submitted: {formatDate(application.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link href="/admin/applications" className="mt-6 w-full py-2 px-4 border border-[#224057] text-[#224057] font-medium rounded-lg hover:bg-[#224057] hover:text-white transition-colors flex items-center justify-center">
                View All Applications
              </Link>
            </div>
          </div>

          {/* Upcoming Inspections Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#224057] mb-4">Upcoming Inspections</h2>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#224057]"></div>
                </div>
              ) : upcomingInspections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No upcoming inspections found
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingInspections.map((inspection) => (
                    <div key={inspection.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex-shrink-0 h-10 w-10 bg-[#224057] text-white rounded-full flex items-center justify-center">
                        <FaCalendarAlt />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {inspection.stage_name || inspection.inspection_stage_name || inspection.inspection_type || 'Inspection'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(inspection.status)}`}>
                            {inspection.status || 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaUser className="mr-1" />
                          <span>
                            Inspector: {
                              inspection.inspector_name ||
                              (inspection.inspector && inspection.inspector.name) ||
                              'Unassigned'
                            }
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaCalendarDay className="mr-1" />
                          <span>
                            Date: {
                              inspection.scheduled_date ?
                              formatDate(inspection.scheduled_date) :
                              'Not scheduled'
                            }
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaMapMarkerAlt className="mr-1" />
                          <span>
                            Stand #{
                              inspection.stand_number ||
                              (inspection.application && inspection.application.stand_number) ||
                              'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area - Second Row */}
        <div className="grid grid-cols-1 gap-6">
          {/* Completed Inspections Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#224057] mb-4">Completed Inspections</h2>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#224057]"></div>
                </div>
              ) : completedInspections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No completed inspections found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedInspections.map((inspection) => (
                    <div key={inspection.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                      <div className="flex-shrink-0 h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <FaCheckCircle />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            {inspection.stage_name || inspection.inspection_stage_name || inspection.inspection_type || 'Inspection'}
                          </h3>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Completed
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaUser className="mr-1" />
                          <span>
                            Inspector: {
                              inspection.inspector_name ||
                              (inspection.inspector && inspection.inspector.name) ||
                              'Unassigned'
                            }
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaCalendarDay className="mr-1" />
                          <span>
                            Date: {
                              inspection.scheduled_date ?
                              formatDate(inspection.scheduled_date) :
                              'Not scheduled'
                            }
                          </span>
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <FaMapMarkerAlt className="mr-1" />
                          <span>
                            Stand #{
                              inspection.stand_number ||
                              (inspection.application && inspection.application.stand_number) ||
                              'N/A'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>


      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;