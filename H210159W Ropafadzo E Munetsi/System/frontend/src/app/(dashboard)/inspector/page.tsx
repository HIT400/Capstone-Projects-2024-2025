////inspector page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from '@/components/Dashboardlayout';
import UserCard from '@/components/UserCard';
import { get } from '@/utils/api';
import { FaUser, FaMapMarkerAlt, FaCalendarDay } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const InspectorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todaysInspections: 0,
    upcomingInspections: 0,
    completedInspections: 0
  });
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [upcomingInspections, setUpcomingInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Enhanced validation for user ID
      if (!user?.id) {
        console.warn('Cannot fetch dashboard data: User ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Log the user ID for debugging
        console.log(`Fetching dashboard data for inspector ID: ${user.id}`);

        // Fetch inspector's inspection schedules
        const schedulesResponse = await get(`inspection-schedules/inspector/${user.id}`);

        // Improved validation for response data
        if (!schedulesResponse.data?.data) {
          console.warn('No schedule data returned from API');
          setLoading(false);
          toast.error('Failed to load inspection data from the server');
          return;
        }

        // Log the response data for debugging
        console.log('API Response data:', schedulesResponse.data);

        const schedules = Array.isArray(schedulesResponse.data.data) ?
          schedulesResponse.data.data : [];

        // Log the schedules for debugging
        console.log(`Received ${schedules.length} inspection schedules from API`);
        if (schedules.length > 0) {
          console.log('First schedule sample:', schedules[0]);
        }

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Calculate stats with additional validation
        const todaysInspections = schedules.filter((inspection: any) =>
          inspection && inspection.scheduled_date === today).length;

        // Get upcoming inspections (scheduled or pending with future dates)
        const upcomingInspections = schedules.filter((inspection: any) =>
          inspection &&
          (inspection.status === 'scheduled' || inspection.status === 'pending') &&
          inspection.scheduled_date &&
          inspection.scheduled_date > today).length;

        // Get all completed inspections
        const completedInspections = schedules.filter((inspection: any) =>
          inspection && inspection.status === 'completed').length;

        setStats({
          todaysInspections,
          upcomingInspections,
          completedInspections
        });

        // Set recent inspections (most recent first) with validation
        if (schedules.length > 0) {
          const validSchedules = schedules.filter((s: any) => s && s.created_at);
          const sortedInspections = [...validSchedules]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          setRecentInspections(sortedInspections);
        }

        // Set upcoming inspections (soonest first) with validation
        if (schedules.length > 0) {
          const upcoming = schedules
            .filter((inspection: any) =>
              inspection &&
              (inspection.status === 'scheduled' || inspection.status === 'pending') &&
              inspection.scheduled_date && inspection.scheduled_date >= today
            )
            .sort((a: any, b: any) =>
              new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
            )
            .slice(0, 5);
          setUpcomingInspections(upcoming);
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);

        // Provide more detailed error message
        const errorMessage = error?.response?.data?.message ||
                            error?.message ||
                            'Failed to load dashboard data';

        console.error('Error details:', {
          message: errorMessage,
          status: error?.response?.status,
          endpoint: `inspection-schedules/inspector/${user.id}`
        });

        toast.error(`Failed to load dashboard data: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <DashboardLayout userRole="inspector">
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#224057]">Inspector Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your inspection overview</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <UserCard type="Todays Inspection" count={stats.todaysInspections} loading={loading} />
        <UserCard type="Upcoming Inspections" count={stats.upcomingInspections} loading={loading} />
        <UserCard type="Completed Inspections" count={stats.completedInspections} loading={loading} />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inspections Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#224057] mb-4">Recent Inspections</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading recent inspections...</p>
              ) : recentInspections.length > 0 ? (
                recentInspections.map((inspection) => (
                  <div key={inspection.id} className="pb-4 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">
                        {inspection.stage_name ? `${inspection.stage_name}` :
                         inspection.stand_number ? `Stand ${inspection.stand_number}` :
                         inspection.application_id ? `Application ${inspection.application_id}` :
                         'Inspection'}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        inspection.status === 'completed' ? 'bg-green-50 text-green-600' :
                        inspection.status === 'scheduled' ? 'bg-blue-50 text-blue-600' :
                        'bg-yellow-50 text-yellow-600'
                      }`}>
                        {inspection.status?.charAt(0).toUpperCase() + inspection.status?.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <p>ID: {inspection.application_id || 'N/A'} | Date: {inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString() : 'Not scheduled'}</p>
                      <p className="mt-1">
                        {inspection.stand_number || inspection.application?.stand_number || 'No stand number'},
                        {inspection.applicant_name || inspection.owner_name || inspection.application?.owner_name || 'No owner name'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No recent inspections found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Inspections Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-[#224057] mb-4">Upcoming Inspections</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-500">Loading upcoming inspections...</p>
              ) : upcomingInspections.length > 0 ? (
                upcomingInspections.map((inspection) => (
                  <div key={inspection.id} className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">
                        {inspection.stage_name ? `${inspection.stage_name}` :
                         inspection.stand_number ? `Stand ${inspection.stand_number}` :
                         inspection.application_id ? `Application ${inspection.application_id}` :
                         'Inspection'}
                      </h3>
                      <span className="px-2 py-1 bg-white text-blue-600 text-xs font-medium rounded-full border border-blue-200">
                        {inspection.status?.charAt(0).toUpperCase() + inspection.status?.slice(1)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FaCalendarDay className="text-gray-500" />
                        <span>{inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleDateString() : 'Not scheduled'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FaMapMarkerAlt className="text-gray-500" />
                        <span>
                          {inspection.stand_number || inspection.application?.stand_number || 'No stand number'}
                          {inspection.district ? `, ${inspection.district}` :
                           inspection.application?.district ? `, ${inspection.application.district}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FaUser className="text-gray-500" />
                        <span>{inspection.applicant_name || inspection.owner_name || inspection.application?.owner_name || 'No owner name'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 p-4">No upcoming inspections scheduled.</p>
              )}
            </div>
          </div>
        </div>
      </div>


    </div>
    </DashboardLayout>
  );
};

export default InspectorDashboard;
