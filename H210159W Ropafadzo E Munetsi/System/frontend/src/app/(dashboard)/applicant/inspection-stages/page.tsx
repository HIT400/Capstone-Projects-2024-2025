'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ApplicationProcessLayout from '@/components/ApplicationProcessLayout'
import { get } from '@/utils/api'
import { toast } from 'react-hot-toast'
import { getNextStageUrl } from '@/utils/applicationFlow'

// Define the inspection stage types
type InspectorDetails = {
  name?: string
  work_id?: string
  district?: string
  specialization?: string
}

type ScheduleDetails = {
  id: number
  scheduled_date: string
  scheduled_time: string
  status: string
  notes?: string
  created_at: string
}

type PaymentDetails = {
  id: number
  amount: number
  payment_method: string
  reference_number: string
  payment_status: string
  payment_type: string
  created_at: string
}

type InspectionStage = {
  id: number
  name: string
  description: string
  status: 'pending' | 'scheduled' | 'completed' | 'failed'
  date?: string
  inspector?: string
  inspector_id?: number
  inspector_details?: InspectorDetails
  stand_number?: string
  owner?: string
  amount_paid?: number
  receipt_number?: string
  location?: string
  comments?: string
  inspection_type_id?: number
  inspection_type?: string
  schedule?: ScheduleDetails
  payment?: PaymentDetails
  // Include original field names for backward compatibility
  schedule_details?: ScheduleDetails
  payment_details?: PaymentDetails
}

// Define the application type
type Application = {
  id: number
  stand_number: string
  owner_name: string
  status: string
  current_stage?: string
  inspection_stages?: InspectionStage[]
}

export default function InspectionStagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState<number | null>(null)
  const [inspectionStages, setInspectionStages] = useState<InspectionStage[]>([])

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)

        // Log the request for debugging
        console.log('Fetching user applications')

        // Use the API utility for authenticated requests
        try {
          const response = await get('application-stages/user/applications')

          console.log('Application response:', response)

          // Validate response data
          if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
            console.log(`Received ${response.data.data.length} applications`)
            console.log('Applications data:', JSON.stringify(response.data.data, null, 2))

            // Validate application data structure
            const validApplications = response.data.data.filter(app =>
              app && typeof app === 'object' && app.id && app.stand_number && app.owner_name
            )

            if (validApplications.length > 0) {
              console.log('Valid applications:', validApplications)
              setApplications(validApplications)
              setSelectedApplication(validApplications[0].id)

              // Fetch inspection stages for the first application
              fetchInspectionStages(validApplications[0].id)
            } else {
              console.warn('No valid applications found in the response')
              toast.error('No valid applications found. Please submit an application first.')
            }
          } else {
            console.warn('No applications data returned from API')
            toast.error('No applications found. Please submit an application first.')
          }
        } catch (apiError) {
          console.error('API error fetching applications:', apiError)
          toast.error('Failed to load applications. Please try again later.')
        }
      } catch (error) {
        // Handle unexpected errors
        console.error('Unexpected error in fetchApplications:', error)
        toast.error('An unexpected error occurred while loading applications.')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Fetch inspection stages for a specific application
  const fetchInspectionStages = async (applicationId: number) => {
    // Validate application ID
    if (!applicationId) {
      console.warn('Cannot fetch inspection stages: Application ID is missing or invalid')
      toast.error('Invalid application selected. Please try again.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Log the request for debugging
      console.log(`Fetching inspection stages for application ID: ${applicationId}`)

      // Use the API utility for authenticated requests with error handling
      try {
        // Regular API call
        const response = await get(`inspection-stages/application/${applicationId}`)

        // Log the full response for debugging
        console.log('Inspection stages API response:', response)

        // Log response structure
        console.log('Response data structure:', {
          hasStatus: response.data && 'status' in response.data,
          status: response.data?.status,
          hasData: response.data && 'data' in response.data,
          dataType: response.data?.data ? typeof response.data.data : 'null/undefined',
          isArray: response.data?.data ? Array.isArray(response.data.data) : false,
          dataLength: response.data?.data && Array.isArray(response.data.data) ? response.data.data.length : 0
        })

        // Debug: Log the raw response data
        console.log('Raw response data:', JSON.stringify(response.data, null, 2))

        // Validate response data
        if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          // If we have valid inspection stages data from the API, use it
          console.log(`Received ${response.data.data.length} inspection stages for application ${applicationId}`)
          console.log('Inspection stages data:', JSON.stringify(response.data.data, null, 2))

          // Check if inspector and payment data is present
          const hasInspectorData = response.data.data.some(stage => stage.inspector)
          const hasPaymentData = response.data.data.some(stage => stage.amount_paid)
          console.log('Has inspector data:', hasInspectorData)
          console.log('Has payment data:', hasPaymentData)

          // Log each stage's inspector and payment data
          response.data.data.forEach((stage: any, index: number) => {
            console.log(`Stage ${index + 1} (${stage.name}):`)
            console.log('  Inspector:', stage.inspector)
            console.log('  Inspector ID:', stage.inspector_id)
            console.log('  Amount paid:', stage.amount_paid)
            console.log('  Receipt number:', stage.receipt_number)
          })

          // Create a copy of the data with default values for missing fields
          const processedStages = response.data.data.map((stage: any) => {
            // Log each stage for debugging
            console.log(`Processing stage ${stage.id} (${stage.name}):`, stage)

            // Extract schedule details if available
            const scheduleDetails = stage.schedule_details || stage.schedule || null
            console.log(`Schedule details for stage ${stage.id}:`, scheduleDetails)

            // Extract payment details if available
            const paymentDetails = stage.payment_details || stage.payment || null
            console.log(`Payment details for stage ${stage.id}:`, paymentDetails)

            // Extract inspector details if available
            const inspectorDetails = stage.inspector_details || null
            console.log(`Inspector details for stage ${stage.id}:`, inspectorDetails)

            // Create a processed stage with all required fields
            const processedStage: InspectionStage = {
              id: stage.id,
              name: stage.name || '',
              description: stage.description || '',
              status: stage.status || 'pending',
              date: stage.date || null,
              inspector: stage.inspector || null,
              inspector_id: stage.inspector_id || null,
              inspector_details: inspectorDetails,
              stand_number: stage.stand_number || '',
              owner: stage.owner || '',
              amount_paid: stage.amount_paid || (paymentDetails ? paymentDetails.amount : null),
              receipt_number: stage.receipt_number || (paymentDetails ? paymentDetails.reference_number : null),
              location: stage.location || null,
              comments: stage.comments || null,
              inspection_type_id: stage.inspection_type_id || null,
              inspection_type: stage.inspection_type || null,
              schedule: scheduleDetails,
              payment: paymentDetails,
              // Ensure these fields are also available in the original format for backward compatibility
              schedule_details: scheduleDetails,
              payment_details: paymentDetails
            }

            console.log(`Processed stage ${stage.id}:`, processedStage)
            return processedStage
          })

          console.log('Processed stages:', processedStages)

          setInspectionStages(processedStages)

          // Check if all stages are completed
          const completedStages = response.data.data.filter((stage: InspectionStage) => stage.status === 'completed')
          if (completedStages.length === response.data.data.length) {
            // Update application status in ApplicationProcessLayout
            // This will trigger a refresh of the application flow visualization
            const appStatusEvent = new CustomEvent('applicationStatusUpdated', {
              detail: { inspectionsCompleted: true }
            });
            window.dispatchEvent(appStatusEvent);

            // If all stages are completed, navigate to certificate page after a delay
            setTimeout(() => {
              const nextStageUrl = getNextStageUrl('inspections')
              if (nextStageUrl) {
                toast.success('All inspections completed! Proceeding to certificate...')
                router.push(nextStageUrl)
              }
            }, 5000) // Longer delay to allow user to see the completed stages
          }
        } else {
          console.warn(`No inspection stages data returned for application ${applicationId}, creating default stages`)

          // Create default stages with application info
          const selectedApp = applications.find(app => app.id === applicationId)
          if (selectedApp) {
            // Create default inspection stages
            const defaultStages: InspectionStage[] = [
              {
                id: 1,
                name: 'Siting and Foundations',
                description: 'Inspection of the building site and foundation work',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              },
              {
                id: 2,
                name: 'DPC Level, Lintel Level and Wall plate Level',
                description: 'Inspection of damp-proof course, lintels, and wall plates',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              },
              {
                id: 3,
                name: 'Roof Trusses',
                description: 'Inspection of roof structure and trusses',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              },
              {
                id: 4,
                name: 'Drain Open Test and Final Test',
                description: 'Final inspection for Certificate of Occupation',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              }
            ];

            setInspectionStages(defaultStages);
          } else {
            console.warn(`Application with ID ${applicationId} not found in loaded applications`)
            toast.error('Application details not found. Using generic inspection stages.')

            // Create generic default stages
            const genericStages: InspectionStage[] = [
              {
                id: 1,
                name: 'Siting and Foundations',
                description: 'Inspection of the building site and foundation work',
                status: 'pending'
              },
              {
                id: 2,
                name: 'DPC Level, Lintel Level and Wall plate Level',
                description: 'Inspection of damp-proof course, lintels, and wall plates',
                status: 'pending'
              },
              {
                id: 3,
                name: 'Roof Trusses',
                description: 'Inspection of roof structure and trusses',
                status: 'pending'
              },
              {
                id: 4,
                name: 'Drain Open Test and Final Test',
                description: 'Final inspection for Certificate of Occupation',
                status: 'pending'
              }
            ];

            setInspectionStages(genericStages);
          }
        }
      } catch (apiError: any) {
        // Handle specific API errors
        if (apiError.response?.status === 404) {
          console.warn(`Application with ID ${applicationId} not found on the server`)
          toast.error('Application not found. Please select a different application.')
        } else {
          console.error('Error fetching inspection stages:', apiError)

          // Log more detailed error information
          console.error('Error details:', {
            message: apiError.message,
            status: apiError.response?.status,
            statusText: apiError.response?.statusText,
            responseData: apiError.response?.data,
            endpoint: `inspection-stages/application/${applicationId}`
          })

          toast.error(`Failed to load inspection stages: ${apiError.message}`)

          // Create default stages with application info as fallback
          const selectedApp = applications.find(app => app.id === applicationId)
          if (selectedApp) {
            // Create default inspection stages
            const defaultStages: InspectionStage[] = [
              {
                id: 1,
                name: 'Siting and Foundations',
                description: 'Inspection of the building site and foundation work',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              },
              {
                id: 2,
                name: 'DPC Level, Lintel Level and Wall plate Level',
                description: 'Inspection of damp-proof course, lintels, and wall plates',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              },
              {
                id: 3,
                name: 'Roof Trusses',
                description: 'Inspection of roof structure and trusses',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              },
              {
                id: 4,
                name: 'Drain Open Test and Final Test',
                description: 'Final inspection for Certificate of Occupation',
                status: 'pending',
                stand_number: selectedApp.stand_number,
                owner: selectedApp.owner_name
              }
            ];

            setInspectionStages(defaultStages);
          }
        }
      }
    } catch (error: any) {
      // Handle unexpected errors
      console.error('Unexpected error in fetchInspectionStages:', error)

      // Log more detailed error information if available
      console.error('Unexpected error details:', {
        message: error.message || 'No error message',
        stack: error.stack || 'No stack trace',
        name: error.name || 'Unknown error type'
      })

      toast.error(`An unexpected error occurred: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle application selection change
  const handleApplicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const appId = parseInt(e.target.value)

      // Validate application ID
      if (isNaN(appId) || appId <= 0) {
        console.warn(`Invalid application ID: ${e.target.value}`)
        toast.error('Invalid application selected. Please try again.')
        return
      }

      // Check if application exists in our loaded applications
      const applicationExists = applications.some(app => app.id === appId)
      if (!applicationExists) {
        console.warn(`Application with ID ${appId} not found in loaded applications`)
        toast.error('Selected application not found in your applications list.')
      }

      console.log(`Application selection changed to ID: ${appId}`)
      setSelectedApplication(appId)
      fetchInspectionStages(appId)
    } catch (error) {
      console.error('Error handling application change:', error)
      toast.error('Failed to change application. Please try again.')
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not scheduled'
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid date'
    }
  }

  // Status badge classes are defined inline in the component

  if (loading) {
    return (
      <ApplicationProcessLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
        </div>
      </ApplicationProcessLayout>
    )
  }

  return (
    <ApplicationProcessLayout>
      <div className="bg-[#edf2f7] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#224057]">Inspection Stages</h2>
                  <p className="text-slate-500 mt-1">Track the progress of your building inspections</p>
                </div>

                {applications.length > 0 && (
                  <div className="mt-4 md:mt-0">
                    <label htmlFor="application-select" className="block text-sm font-medium text-gray-700 mb-1">
                      Select Application
                    </label>
                    <select
                      id="application-select"
                      value={selectedApplication || ''}
                      onChange={handleApplicationChange}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#224057] focus:border-[#224057] sm:text-sm rounded-md"
                    >
                      {applications.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.stand_number} - {app.owner_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No applications found. Please submit an application first.</p>
                <button
                  onClick={() => router.push('/applicant/application-form')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#224057] hover:bg-[#1a344d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057]"
                >
                  Create Application
                </button>
              </div>
            ) : (
              <div className="p-6">
                {/* Inspection Stages Table */}
                {inspectionStages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stage
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inspector
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inspectionStages.map((stage) => {
                          // Get status badge color
                          const statusColor =
                            stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                            stage.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            stage.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800';

                          return (
                            <tr key={stage.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{stage.name}</div>
                                <div className="text-xs text-gray-500">{stage.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                                  {stage.status.charAt(0).toUpperCase() + stage.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {(stage.status === 'scheduled' || stage.status === 'completed') && (stage.date || (stage.schedule && stage.schedule.scheduled_date))
                                    ? formatDate(stage.date || (stage.schedule && stage.schedule.scheduled_date))
                                    : 'Not scheduled'}
                                </div>
                                {stage.schedule && stage.schedule.scheduled_time && (
                                  <div className="text-xs text-gray-500">
                                    Time: {stage.schedule.scheduled_time}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {stage.inspector || 'Not assigned'}
                                </div>
                                {stage.inspector_details && (
                                  <div className="text-xs text-gray-500">
                                    {stage.inspector_details.district && (
                                      <span>{stage.inspector_details.district}</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {stage.amount_paid
                                    ? `$${stage.amount_paid.toFixed(2)}`
                                    : stage.payment && stage.payment.amount
                                      ? `$${stage.payment.amount.toFixed(2)}`
                                      : 'Consolidated'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {stage.receipt_number || (stage.payment?.reference_number ? stage.payment.reference_number : '')}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => {
                                    const detailsRow = document.getElementById(`details-row-${stage.id}`);
                                    if (detailsRow) {
                                      detailsRow.classList.toggle('hidden');
                                    }
                                  }}
                                  className="text-[#224057] hover:text-[#1a344d] mr-3"
                                >
                                  Details
                                </button>
                                {stage.status === 'pending' && (
                                  <button
                                    onClick={() => router.push('/applicant/inspection-scheduling')}
                                    className="text-[#224057] hover:text-[#1a344d]"
                                  >
                                    Schedule
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Expandable Details Sections */}
                    {inspectionStages.map((stage) => (
                      <div key={`details-${stage.id}`} id={`details-row-${stage.id}`} className="hidden border-t border-gray-200 p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Inspection Details</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">Stand Number:</span>
                                <span className="text-sm text-gray-900">{stage.stand_number || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm font-medium text-gray-500">Owner:</span>
                                <span className="text-sm text-gray-900">{stage.owner || 'N/A'}</span>
                              </div>
                              {stage.inspector_details && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Inspector ID:</span>
                                    <span className="text-sm text-gray-900">{stage.inspector_details.work_id || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Specialization:</span>
                                    <span className="text-sm text-gray-900">{stage.inspector_details.specialization || 'N/A'}</span>
                                  </div>
                                </>
                              )}
                              {stage.schedule && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Schedule Status:</span>
                                    <span className="text-sm text-gray-900">{stage.schedule.status || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Notes:</span>
                                    <span className="text-sm text-gray-900">{stage.schedule.notes || 'None'}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Payment Information</h4>
                            {stage.payment && (
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-500">Method:</span>
                                  <span className="text-sm text-gray-900">{stage.payment.payment_method || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-500">Status:</span>
                                  <span className="text-sm text-gray-900">{stage.payment.payment_status || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-500">Type:</span>
                                  <span className="text-sm text-gray-900">{stage.payment.payment_type || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm font-medium text-gray-500">Date:</span>
                                  <span className="text-sm text-gray-900">
                                    {stage.payment.created_at ? new Date(stage.payment.created_at).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            )}
                            {!stage.payment && (
                              <div className="text-sm text-gray-500">
                                {stage.status === 'scheduled' || stage.status === 'completed'
                                  ? 'Paid with consolidated payment'
                                  : 'Payment information will be available after scheduling'}
                              </div>
                            )}
                          </div>
                        </div>

                        {stage.comments && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Inspector Comments</h4>
                            <div className="bg-white p-3 rounded-md">
                              <p className="text-sm text-gray-700">{stage.comments}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No inspection stages found for this application.</p>
                  </div>
                )}


              </div>
            )}
          </div>
        </div>
      </div>
    </ApplicationProcessLayout>
  )
}
