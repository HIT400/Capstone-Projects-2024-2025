'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import DashboardLayout from '@/components/Dashboardlayout'
import { get, put, post } from '@/utils/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface Schedule {
  id: string
  scheduled_date: string
  scheduled_time: string
  status: string
  notes?: string
  created_at: string
  inspector_id?: string
}

interface InspectionStage {
  id: string
  application_id: string
  name: string
  stage_name?: string // For backward compatibility
  description?: string
  status: string
  date?: string
  inspector_id: string | null
  inspection_date: string | null
  comments: string | null
  amount_paid?: number
  receipt_number?: string
  location?: string
  inspection_type_id?: number
  inspector_name?: string
  inspection_type_name?: string
  created_at: string
  updated_at: string
  schedule?: Schedule
  inspector_details?: {
    id?: string
    name?: string
    work_id?: string
    district?: string
    specialization?: string
  }
}

interface Application {
  id: string
  owner_name: string
  owner_email?: string
  owner_phone?: string
  stand_number: string
  district: string
  status: string
  project_name?: string
  project_description?: string
  created_at?: string
  updated_at?: string
  user_id?: string
}

export default function InspectorInspectionsPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('applicationId')

  const [inspectionStages, setInspectionStages] = useState<InspectionStage[]>([])
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStage, setSelectedStage] = useState<InspectionStage | null>(null)
  const [comments, setComments] = useState('')
  const [status, setStatus] = useState('pending')
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchInspectionStages = async () => {
      try {
        setLoading(true)

        // If applicationId is provided, fetch stages for that application
        if (applicationId) {
          // Log the request for debugging
          console.log(`Fetching inspection stages for application ID: ${applicationId}`)

          // Fetch all inspection stages for this application
          const response = await get(`inspection-stages/application/${applicationId}`)

          // Log the response for debugging
          console.log('Inspection stages response:', response.data)

          if (response.data?.data) {
            const allStages = Array.isArray(response.data.data) ? response.data.data : []
            console.log(`Received ${allStages.length} inspection stages from API`)

            // Log the current user ID
            console.log('Current user ID:', user?.id)

            // Log all stages with their inspector_id for debugging
            console.log('All stages with inspector_id:')
            allStages.forEach((stage, index) => {
              console.log(`Stage ${index + 1} - ID: ${stage.id}, Name: ${stage.name || stage.stage_name}, Inspector ID: ${stage.inspector_id}`)
            })

            // Log the types of IDs for debugging
            console.log('User ID type:', typeof user?.id)
            if (allStages.length > 0) {
              console.log('Inspector ID type:', typeof allStages[0].inspector_id)
            }

            // Filter stages to only include those assigned to the current inspector
            // Check multiple possible locations for inspector_id and convert to strings for comparison
            const inspectorStages = allStages.filter(stage => {
              // Check all possible locations for inspector_id
              const directInspectorId = stage.inspector_id ? String(stage.inspector_id) : null
              const inspectorDetailsId = stage.inspector_details?.id ? String(stage.inspector_details.id) : null
              const scheduleInspectorId = stage.schedule?.inspector_id ? String(stage.schedule.inspector_id) : null

              const currentUserId = user?.id ? String(user.id) : null

              // Check if any of the possible inspector IDs match the current user ID
              // Also check for numeric equality in case of type mismatches
              const isAssignedDirect = directInspectorId === currentUserId ||
                                      (directInspectorId && currentUserId && Number(directInspectorId) === Number(currentUserId))

              const isAssignedDetails = inspectorDetailsId === currentUserId ||
                                       (inspectorDetailsId && currentUserId && Number(inspectorDetailsId) === Number(currentUserId))

              const isAssignedSchedule = scheduleInspectorId === currentUserId ||
                                        (scheduleInspectorId && currentUserId && Number(scheduleInspectorId) === Number(currentUserId))

              const isAssigned = isAssignedDirect || isAssignedDetails || isAssignedSchedule

              console.log(`Stage ${stage.id} (${stage.name || stage.stage_name}):`)
              console.log(`  - Direct Inspector ID: ${directInspectorId} (${typeof stage.inspector_id})`)
              console.log(`  - Inspector Details ID: ${inspectorDetailsId}`)
              console.log(`  - Schedule Inspector ID: ${scheduleInspectorId}`)
              console.log(`  - Current User ID: ${currentUserId} (${typeof user?.id})`)
              console.log(`  - Is Assigned: ${isAssigned} (Direct: ${isAssignedDirect}, Details: ${isAssignedDetails}, Schedule: ${isAssignedSchedule})`)

              return isAssigned
            })

            console.log(`Filtered to ${inspectorStages.length} stages assigned to inspector ${user?.id}`)

            // Log the first stage to see its structure
            if (inspectorStages.length > 0) {
              console.log('First inspector stage sample:', inspectorStages[0])

              // Set the filtered stages that are assigned to this inspector
              setInspectionStages(inspectorStages)
            } else {
              console.warn('No inspection stages found for this inspector')

              // Don't create default stages - only show what's been scheduled for this inspector
              setInspectionStages([])
              setError('No inspection stages have been assigned to you for this application.')

              // Show a toast notification to make it clear to the user
              toast.info('You are not assigned to any inspection stages for this application.')
              return
            }

            // Also fetch application details
            const appResponse = await get(`applications/${applicationId}`)

            // Log the application response for debugging
            console.log('Application response:', appResponse.data)

            if (appResponse.data?.data) {
              console.log('Application data:', appResponse.data.data)
              setApplication(appResponse.data.data as Application)
            } else {
              console.warn('No application data returned from API')

              // Create a default application object with the application ID
              const defaultApplication = {
                id: applicationId,
                owner_name: 'Application Owner',
                stand_number: 'Unknown',
                district: 'Unknown District',
                status: 'pending'
              }

              console.log('Created default application for display:', defaultApplication)
              setApplication(defaultApplication)
            }
          } else {
            console.warn('No data property in API response')

            // Don't create default stages - only show what's been scheduled for this inspector
            setInspectionStages([])
            setError('No inspection stages have been assigned to you for this application.')

            // Show a toast notification to make it clear to the user
            toast.info('You are not assigned to any inspection stages for this application.')
          }
        } else {
          // Otherwise fetch all stages assigned to this inspector
          const response = await get(`inspection-stages/inspector/${user?.id}`)

          if (response.data?.data) {
            setInspectionStages(Array.isArray(response.data.data) ? response.data.data : [])
          } else {
            setError('No inspection stages found.')
          }
        }
      } catch (error: any) {
        console.error('Error fetching inspection stages:', error)

        // Provide more detailed error message
        const errorMessage = error?.response?.data?.message ||
                            error?.message ||
                            'Failed to load inspection stages'

        console.error('Error details:', {
          message: errorMessage,
          status: error?.response?.status,
          endpoint: applicationId ? `inspection-stages/application/${applicationId}` : `inspection-stages/inspector/${user?.id}`
        })

        toast.error(`Failed to load inspection stages: ${errorMessage}`)
        setError(`Failed to load inspection stages: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchInspectionStages()
    }
  }, [user, applicationId])

  const handleStageSelect = (stage: InspectionStage) => {
    setSelectedStage(stage)
    setComments(stage.comments || '')
    setStatus(stage.status || 'pending')
  }

  const handleUpdateStage = async () => {
    if (!selectedStage) return

    try {
      setIsUpdating(true)

      // Get the schedule ID from the stage
      // Log the selected stage for debugging
      console.log('Selected stage:', selectedStage)

      // Try to get the schedule ID from different possible locations
      let scheduleId = null
      if (selectedStage.schedule?.id) {
        scheduleId = selectedStage.schedule.id
        console.log('Using schedule ID from stage.schedule:', scheduleId)
      } else if (selectedStage.id) {
        // If we can't find a schedule ID, use the stage ID as a fallback
        scheduleId = selectedStage.id
        console.log('Using stage ID as fallback:', scheduleId)
      }

      if (!scheduleId) {
        toast.error('Could not determine schedule ID. Please try again.')
        setIsUpdating(false)
        return
      }

      // If the status is "approved", use the new complete inspection endpoint
      if (status === 'approved') {
        const response = await post(`inspection-schedules/${scheduleId}/complete`, {
          comments
        })

        if (response.data?.data) {
          toast.success('Inspection marked as completed successfully!')

          // Update the stage in the local state
          setInspectionStages(prevStages =>
            prevStages.map(stage =>
              stage.id === selectedStage.id
                ? {
                    ...stage,
                    status: 'completed',
                    comments,
                    inspection_date: new Date().toISOString().split('T')[0],
                    schedule: {
                      ...stage.schedule,
                      status: 'completed'
                    }
                  }
                : stage
            )
          )

          toast.success('Applicant can now schedule the next inspection stage')
          setSelectedStage(null)
        }
      } else {
        // For other statuses, use the regular update endpoint
        const response = await put(`inspection-stages/${selectedStage.id}`, {
          status,
          comments,
          inspector_id: user?.id,
          inspection_date: new Date().toISOString().split('T')[0] // Today's date
        })

        if (response.data?.data) {
          toast.success('Inspection stage updated successfully!')

          // Update the stage in the local state
          setInspectionStages(prevStages =>
            prevStages.map(stage =>
              stage.id === selectedStage.id
                ? { ...stage, status, comments, inspection_date: new Date().toISOString().split('T')[0] }
                : stage
            )
          )

          setSelectedStage(null)
        }
      }
    } catch (error: any) {
      console.error('Error updating inspection stage:', error)

      // Get the error message from the response if available
      const errorMessage = error.response?.data?.message || 'Failed to update inspection stage. Please try again later.'
      toast.error(errorMessage)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <DashboardLayout userRole="inspector">
      <div className="bg-[#edf2f7] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with application info if available */}
          {application && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold text-[#224057]">{application.owner_name}'s Application</h2>
                {inspectionStages.length === 0 && (
                  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm">
                    You are not assigned to any inspection stages for this application
                  </div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Stand Number</p>
                  <p className="font-medium">{application.stand_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">
                    {application.district ?
                      application.district :
                      'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${application.status === 'approved' ? 'bg-green-100 text-green-800' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      application.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'}`}>
                    {application.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left panel - Inspection Stages List */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-[#224057]">
                    {inspectionStages.length === 1 ? 'Your Assigned Inspection' : 'Your Assigned Inspections'}
                  </h2>
                </div>

                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224057] mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading inspection stages...</p>
                  </div>
                ) : error ? (
                  <div className="p-6 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : inspectionStages.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-slate-500">
                      {error || "No inspection stages have been assigned to you for this application."}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {inspectionStages.map((stage) => (
                      <div
                        key={stage.id}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedStage?.id === stage.id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleStageSelect(stage)}
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-gray-900">
                            {stage.stage_name || stage.name || `Stage ${stage.id}`}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full
                            ${stage.status === 'approved' ? 'bg-green-100 text-green-800' :
                              stage.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              stage.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'}`}>
                            {stage.status ? stage.status.toUpperCase() : 'PENDING'}
                          </span>
                        </div>
                        {(stage.inspection_date || stage.date) && (
                          <p className="text-sm text-gray-500 mt-1">
                            Inspection Date: {new Date(stage.inspection_date || stage.date).toLocaleDateString()}
                          </p>
                        )}
                        {stage.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {stage.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right panel - Inspection Details */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-[#224057]">
                    {selectedStage ? `${selectedStage.stage_name || selectedStage.name || 'Inspection'} Details` : 'Inspection Assignment Details'}
                  </h2>
                </div>

                {!selectedStage ? (
                  <div className="p-6 text-center">
                    {inspectionStages.length === 0 ? (
                      <p className="text-slate-500">No inspection stages have been assigned to you for this application.</p>
                    ) : (
                      <p className="text-slate-500">Select an inspection stage to view details</p>
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="approved">Approved - Mark as Completed</option>
                        <option value="rejected">Rejected - Failed Inspection</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={6}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        placeholder="Enter your inspection comments here..."
                      ></textarea>
                      {status === 'approved' && (
                        <p className="mt-2 text-sm text-green-600">
                          <strong>Note:</strong> When you mark this inspection as completed, the applicant will be able to schedule the next inspection stage.
                        </p>
                      )}
                      {status === 'rejected' && (
                        <p className="mt-2 text-sm text-red-600">
                          <strong>Note:</strong> If you reject this inspection, the applicant will need to reschedule it.
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleUpdateStage}
                      disabled={isUpdating}
                      className="w-full py-2 px-4 bg-[#224057] text-white font-medium rounded-lg hover:bg-[#1a344a] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? 'Updating...' : 'Update Inspection'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
