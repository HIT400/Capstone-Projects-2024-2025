'use client'

import { useState, useEffect } from 'react'
import { get } from '@/utils/api'
import toast from '@/utils/toast'
import Link from 'next/link'

interface Inspection {
  id: string
  application_id: string
  inspector_id: string
  scheduled_date: string
  scheduled_time: string
  status: string
  notes?: string
  inspector_name?: string
  inspector?: {
    id: string
    name: string
    email: string
    work_id?: string
    district?: string
  }
  inspection_type?: string
  inspection_stage_name?: string
  stand_number?: string
  application?: {
    id: string
    stand_number: string
    owner_name: string
  }
}

export default function ScheduledInspections({ applicationId }: { applicationId?: string | null }) {
  const [inspections, setInspections] = useState<Inspection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Maximum number of retry attempts
    const MAX_RETRIES = 3;

    const fetchInspections = async (retryCount = 0) => {
      try {
        setLoading(true)

        // Log the request for debugging
        console.log(`Fetching inspection schedules${applicationId ? ` for application ${applicationId}` : ' for user'} (Attempt ${retryCount + 1})`)

        // Determine the endpoint based on whether an applicationId is provided
        const endpoint = applicationId
          ? `inspection-schedules/application/${applicationId}`
          : 'inspection-schedules/user/applications'

        try {
          // Use our API utility which has better error handling
          console.log(`Making API request to: ${endpoint}`)
          const response = await get(endpoint)

          // Log the full response for debugging
          console.log(`API Response from ${endpoint}:`, response)

          // Validate response data with detailed logging
          if (response && response.data) {
            console.log(`Response data structure:`, {
              hasStatus: 'status' in response.data,
              status: response.data.status,
              hasData: 'data' in response.data,
              dataType: response.data.data ? typeof response.data.data : 'null/undefined',
              isArray: response.data.data ? Array.isArray(response.data.data) : false,
              dataLength: response.data.data && Array.isArray(response.data.data) ? response.data.data.length : 0
            })

            if (response.data.data) {
              // Check if data is an array
              if (Array.isArray(response.data.data)) {
                console.log(`Received ${response.data.data.length} inspection schedules`)
                // Log the first item if available
                if (response.data.data.length > 0) {
                  console.log('First inspection item:', response.data.data[0])
                }

                // Validate and transform each inspection object
                const validInspections = response.data.data.filter((inspection: any) => {
                  return inspection &&
                    typeof inspection === 'object' &&
                    inspection.id;
                }).map((inspection: any) => {
                  // Log the inspection object to help with debugging
                  console.log('Processing inspection:', inspection);

                  // Return a normalized inspection object with all possible field mappings
                  // Log the raw inspection object to help with debugging
                  console.log('Raw inspection object:', inspection);

                  // Create a normalized object with all possible field mappings
                  const normalizedInspection = {
                    ...inspection,
                    // Ensure these fields exist even if they're null/undefined
                    stand_number: inspection.stand_number ||
                                  (inspection.application ? inspection.application.stand_number : null),
                    inspector_name: inspection.inspector_name ||
                                   (inspection.inspector ? inspection.inspector.name : null) ||
                                   (inspection.inspector_details ? inspection.inspector_details.name : null),
                    // Make sure inspector_work_id and inspector_district are available at the top level
                    inspector_work_id: inspection.inspector_work_id ||
                                      (inspection.inspector ? inspection.inspector.work_id : null),
                    inspector_district: inspection.inspector_district ||
                                       (inspection.inspector ? inspection.inspector.district : null),
                    inspection_type: inspection.inspection_type ||
                                    inspection.inspection_type_name ||
                                    inspection.inspection_stage_name ||
                                    'General Inspection',
                    scheduled_date: inspection.scheduled_date ||
                                   inspection.date ||
                                   (inspection.schedule ? inspection.schedule.scheduled_date : null),
                    scheduled_time: inspection.scheduled_time ||
                                   (inspection.schedule ? inspection.schedule.scheduled_time : null) ||
                                   '09:00:00',
                    // Ensure status has a default value
                    status: inspection.status || 'scheduled'
                  };

                  console.log('Normalized inspection object:', normalizedInspection);
                  return normalizedInspection;
                });

                if (validInspections.length > 0) {
                  console.log('Valid inspections after processing:', validInspections);
                  setInspections(validInspections);
                } else {
                  console.warn('No valid inspection objects found in the response');
                  setInspections([]);
                }
              } else {
                console.warn(`API returned non-array data for ${endpoint}`)
                setInspections([])
              }
            } else {
              console.warn(`No data property in response for ${endpoint}`)
              setInspections([])
            }
          } else {
            console.warn(`Invalid response format for ${endpoint}`)
            setInspections([])
          }
        } catch (apiError: any) {
          // Log detailed error information to help diagnose backend issues
          console.error(`API error fetching inspections (Attempt ${retryCount + 1}):`, apiError)

          // Log more detailed error information
          console.error('Error details:', {
            message: apiError.message,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            responseData: apiError.response?.data,
            endpoint: endpoint
          })

          // Check if we should retry the request
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying inspection data fetch (${retryCount + 1}/${MAX_RETRIES})...`)

            // Wait a bit before retrying (exponential backoff)
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));

            // Retry the request
            return fetchInspections(retryCount + 1);
          }

          // If we've exhausted all retries, show a user-friendly error message
          // Don't show technical error details to the user
          toast.error('Could not load inspection data. Please try again later.')

          // Log the error for debugging but don't show it to the user
          console.error(`Failed to load inspection data: ${apiError.message}`)

          // Set a user-friendly error message
          setError('Unable to retrieve inspection data. Please try again later.')
          setInspections([])
        }
      } catch (error: any) {
        // Handle unexpected errors
        console.error('Unexpected error in fetchInspections:', error)

        // Set a user-friendly error message
        setError('Unable to retrieve inspection data. Please try again later.')
        setInspections([])
      } finally {
        setLoading(false)
      }
    }

    fetchInspections()
  }, [applicationId])

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled'
    try {
      // Handle different date formats
      let date: Date;

      // Check if it's a timestamp with time component
      if (dateString.includes('T') || dateString.includes(' ')) {
        date = new Date(dateString);
      } else {
        // Handle YYYY-MM-DD format
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        date = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date: ${dateString}`);
        return 'Invalid date';
      }

      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      console.error(`Error formatting date ${dateString}:`, error);
      return 'Invalid date'
    }
  }

  // Format time
  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    try {
      // Parse time string (HH:MM:SS or HH:MM)
      const parts = timeString.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) {
        console.warn(`Invalid time format: ${timeString}`);
        return timeString;
      }

      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error(`Error formatting time ${timeString}:`, error);
      return timeString // Return original if parsing fails
    }
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#224057]"></div>
      </div>
    )
  }

  if (inspections.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center">
        <p className="text-gray-500">No scheduled inspections found.</p>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <p className="text-sm text-gray-400 mt-2">
          After completing your stage payments, you can schedule inspections for your building project.
        </p>
        <Link
          href="/applicant/inspection-scheduling"
          className="mt-4 inline-block px-4 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d]"
        >
          Schedule an Inspection
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr key="header-row">
              <th key="header-stand-number" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stand Number
              </th>
              <th key="header-inspector" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Inspector
              </th>
              <th key="header-date-time" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th key="header-type" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th key="header-status" scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inspections.map((inspection) => (
              <tr key={inspection.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {inspection.stand_number || inspection.application?.stand_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Handle different ways the inspector name might be provided */}
                  {inspection.inspector_name ||
                   (inspection.inspector && inspection.inspector.name) ||
                   'Not assigned'}

                  {/* Only show work ID if it exists */}
                  {(inspection.inspector?.work_id || inspection.inspector_work_id) && (
                    <div className="text-xs text-gray-400">
                      ID: {inspection.inspector?.work_id || inspection.inspector_work_id}
                    </div>
                  )}

                  {/* Only show district if it exists */}
                  {(inspection.inspector?.district || inspection.inspector_district) && (
                    <div className="text-xs text-gray-400">
                      District: {inspection.inspector?.district || inspection.inspector_district}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(inspection.scheduled_date)}
                  <div className="text-xs text-gray-400">{formatTime(inspection.scheduled_time)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {inspection.inspection_type || inspection.inspection_stage_name || 'General Inspection'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
