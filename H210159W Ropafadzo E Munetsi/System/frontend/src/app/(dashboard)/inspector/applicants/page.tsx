'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Dashboardlayout'
import { get } from '@/utils/api'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

interface Application {
  id: string
  application_id: string
  inspector_id: string
  scheduled_date: string
  scheduled_time: string
  status: string
  notes?: string
  created_at: string
  updated_at: string
  stand_number?: string
  application_status?: string
  applicant_name?: string
  applicant_email?: string
  applicant_contact?: string
  district?: string
}

export default function InspectorApplicantsPage() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)

        // Validate user ID before making the API call
        if (!user?.id) {
          console.warn('Cannot fetch applications: User ID is missing')
          setError('User information is not available. Please try logging in again.')
          setLoading(false)
          return
        }

        // Log the user ID for debugging
        console.log(`Fetching applications for inspector ID: ${user.id}`)

        // Fetch applications assigned to this inspector
        const response = await get(`inspection-schedules/inspector/${user.id}`)

        // Log the response for debugging
        console.log('API Response:', response.data)

        if (response.data?.data) {
          const schedules = Array.isArray(response.data.data) ? response.data.data : []
          console.log(`Received ${schedules.length} schedules from API`)

          // Log the first item to see its structure
          if (schedules.length > 0) {
            console.log('First schedule sample:', schedules[0])
          }

          setApplications(schedules as Application[])
        } else {
          console.warn('No application data returned from API')
          setError('No applications found.')
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        toast.error('Failed to load applications. Please try again later.')
        setError('Failed to load applications. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    // Only fetch data if user is loaded and has an ID
    if (user?.id) {
      fetchApplications()
    } else {
      // If no user ID, set appropriate loading/error state
      setLoading(false)
      setError('Please log in to view your assigned applications.')
    }
  }, [user])

  return (
    <DashboardLayout userRole="inspector">
      <div className="bg-[#edf2f7] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#224057]">Applicants</h2>
                  <p className="text-slate-500 mt-1">View and manage applicants assigned to you</p>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224057] mx-auto"></div>
                <p className="mt-4 text-slate-500">Loading applicants...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-500">No applicants assigned to you yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr key="header-row">
                      <th key="header-owner" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th key="header-contact" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th key="header-stand-number" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Stand Number
                      </th>
                      <th key="header-district" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        District
                      </th>
                      <th key="header-status" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th key="header-date-submitted" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th key="header-actions" scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {applications.map((application) => (
                      <tr key={application.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{application.applicant_name || 'Not available'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">{application.applicant_email || 'No email'}</div>
                          <div className="text-sm text-slate-500">{application.applicant_contact || 'No contact'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{application.stand_number || 'Not available'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">{application.district || 'Not specified'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${application.status === 'completed' ? 'bg-green-100 text-green-800' :
                              application.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              application.status === 'rescheduled' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'}`}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-500">
                            {new Date(application.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {application.application_id ? (
                            <Link
                              href={`/inspector/inspections?applicationId=${application.application_id}`}
                              className="text-[#224057] hover:text-[#1a344a] mr-4"
                            >
                              View Inspections
                            </Link>
                          ) : (
                            <span className="text-gray-400">No Application ID</span>
                          )}
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
  )
}
