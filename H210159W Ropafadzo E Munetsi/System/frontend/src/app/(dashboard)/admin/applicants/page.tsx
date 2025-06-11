'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboardlayout';
import { get } from '@/utils/api';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaIdCard } from 'react-icons/fa';

interface Applicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  physicalAddress: string;
  nationalIdNumber: string;
  createdAt: string;
}

const ApplicantsPage: React.FC = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all users with role 'applicant'
        const response = await get('auth/users');

        console.log('API Response for users:', response);
        console.log('Response data structure:', {
          hasData: !!response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          hasNestedData: response.data && 'data' in response.data,
          nestedDataType: response.data && 'data' in response.data ? typeof response.data.data : 'N/A',
          isNestedArray: response.data && 'data' in response.data ? Array.isArray(response.data.data) : false
        });

        // The auth/users endpoint returns users directly in the response body
        // This is different from other endpoints that wrap data in a 'data' property
        const userData = response.data;

        if (Array.isArray(userData)) {
          console.log('Users data (array format):', userData);

          // Filter users with role 'applicant'
          const applicantUsers = userData.filter(
            (user: any) => {
              console.log('User role:', user.role);
              return user.role === 'applicant';
            }
          );

          console.log('Filtered applicant users:', applicantUsers);
          setApplicants(applicantUsers);
        } else if (userData && userData.data && Array.isArray(userData.data)) {
          // Handle nested data format just in case
          console.log('Users data (nested format):', userData.data);

          const applicantUsers = userData.data.filter(
            (user: any) => {
              console.log('User role:', user.role);
              return user.role === 'applicant';
            }
          );

          console.log('Filtered applicant users:', applicantUsers);
          setApplicants(applicantUsers);
        } else {
          console.log('No valid users data found in response');
          setApplicants([]);
        }
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('Failed to load applicants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#224057]">Applicants</h1>
          <p className="text-gray-600 mt-2">Manage all registered applicants</p>
        </div>

        {/* Applicants List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#224057]">All Applicants</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search applicants..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#224057]"
                />
                <button className="bg-[#224057] text-white px-4 py-2 rounded-lg hover:bg-[#1a344d] transition-colors">
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            ) : applicants.length === 0 ? (
              <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                No applicants found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registered On
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applicants.map((applicant) => (
                      <tr key={applicant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-[#224057] text-white rounded-full flex items-center justify-center">
                              <FaUser />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {applicant.firstName} {applicant.lastName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <FaEnvelope className="text-gray-400" /> {applicant.email}
                          </div>
                          <div className="text-sm text-gray-900 flex items-center gap-1 mt-1">
                            <FaPhone className="text-gray-400" /> {applicant.contactNumber}
                          </div>
                          <div className="text-sm text-gray-900 flex items-center gap-1 mt-1">
                            <FaMapMarkerAlt className="text-gray-400" /> {applicant.physicalAddress}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <FaIdCard className="text-gray-400" /> {applicant.nationalIdNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {applicant.createdAt ? formatDate(applicant.createdAt) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-[#224057] hover:text-[#1a344d] mr-3">
                            View Details
                          </button>
                          <button className="text-red-600 hover:text-red-800">
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ApplicantsPage;