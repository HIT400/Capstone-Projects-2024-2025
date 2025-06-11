'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { post, get } from '@/utils/api'
import ApplicationProcessLayout from '@/components/ApplicationProcessLayout'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { getNextStageUrl } from '@/utils/applicationFlow'

interface Application {
  id: string
  stand_number: string
  status: string
  current_stage?: string
  district?: string
}

interface InspectionStage {
  id: number
  name: string
  description: string
  status: string
  inspection_type_id?: number
  inspection_type?: string
  sequence_order?: number
}

interface Inspector {
  inspector_id: string
  inspector_name: string
  specialization: string
  inspection_type: string
  assigned_district: string
  scheduled_count: number
}

export default function InspectionSchedulingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedApplication, setSelectedApplication] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [notes, setNotes] = useState('')
  const [availableInspector, setAvailableInspector] = useState<Inspector | null>(null)
  const [isSearchingInspector, setIsSearchingInspector] = useState(false)
  const [error, setError] = useState('')
  const [currentStage, setCurrentStage] = useState<InspectionStage | null>(null)
  const [loadingStage, setLoadingStage] = useState(false)

  // Fetch the current inspection stage for an application
  const fetchCurrentStage = async (applicationId: string) => {
    if (!applicationId) return

    try {
      setLoadingStage(true)
      setError(null) // Clear any previous errors

      const response = await get(`inspection-stages/application/${applicationId}`)

      if (response.data?.data && response.data.data.length > 0) {
        const stages = response.data.data;

        // Sort stages by sequence_order to ensure we get them in the correct order
        stages.sort((a: InspectionStage, b: InspectionStage) =>
          (a.sequence_order || 0) - (b.sequence_order || 0)
        );

        // First, check if there's a scheduled stage that's not completed
        const scheduledStage = stages.find(
          (stage: InspectionStage) => stage.status === 'scheduled'
        );

        if (scheduledStage) {
          setCurrentStage(scheduledStage);
          setError(`There is already a scheduled inspection for "${scheduledStage.name}". Please wait for this inspection to be completed before scheduling the next stage.`);
          return;
        }

        // If no scheduled stage, find the first pending stage
        const pendingStage = stages.find(
          (stage: InspectionStage) => stage.status === 'pending'
        );

        if (pendingStage) {
          // Check if this is the first stage or if the previous stage is completed
          const stageIndex = stages.findIndex((s: InspectionStage) => s.id === pendingStage.id);

          if (stageIndex === 0) {
            // This is the first stage, so it's valid to schedule
            setCurrentStage(pendingStage);
          } else {
            // Check if the previous stage is completed
            const previousStage = stages[stageIndex - 1];

            if (previousStage.status === 'completed') {
              // Previous stage is completed, so this stage is valid to schedule
              setCurrentStage(pendingStage);
            } else {
              // Previous stage is not completed, so show an error
              setCurrentStage(pendingStage);
              setError(`Previous stage "${previousStage.name}" must be completed before scheduling "${pendingStage.name}".`);
            }
          }
        } else {
          // No pending stages found
          const allCompleted = stages.every((stage: InspectionStage) => stage.status === 'completed');

          if (allCompleted) {
            setCurrentStage(null);
            setError('All inspection stages have been completed for this application.');
          } else {
            setCurrentStage(null);
            setError('No pending inspection stages found for this application.');
          }
        }
      } else {
        setCurrentStage(null);
        setError('No inspection stages found for this application.');
      }
    } catch (error) {
      console.error('Error fetching inspection stages:', error)
      setCurrentStage(null);
      setError('Failed to fetch inspection stages. Please try again later.');
    } finally {
      setLoadingStage(false)
    }
  }

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true)

        const response = await get('application-stages/user/applications')

        if (response.data.data && response.data.data.length > 0) {
          // Filter applications that are in appropriate status for inspection
          const eligibleApplications = response.data.data.filter(
            (app: any) => ['submitted', 'in_review', 'approved'].includes(app.status)
          )

          setApplications(eligibleApplications)

          if (eligibleApplications.length > 0) {
            setSelectedApplication(eligibleApplications[0].id)
            // Fetch the current stage for the first application
            fetchCurrentStage(eligibleApplications[0].id)
          }
        } else {
          setError('No eligible applications found. Please submit an application first.')
        }
      } catch (error) {
        console.error('Error fetching applications:', error)
        setError('Failed to load applications. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  // Find available inspector based on selected date and inspection type
  const findAvailableInspector = async () => {
    if (!scheduledDate) {
      toast.error('Please select a date first')
      return
    }

    try {
      // Clear any previous errors when starting a new search
      setError(null)
      setIsSearchingInspector(true)

      // Build query parameters
      const params: any = { scheduledDate };

      // Add inspection type ID if available
      if (currentStage && currentStage.inspection_type_id) {
        params.inspectionTypeId = currentStage.inspection_type_id;
        console.log(`Adding inspection type ID: ${currentStage.inspection_type_id}`);
      } else if (currentStage && currentStage.inspection_type) {
        // If we have the inspection type name but not the ID, try to find the ID
        console.log(`No inspection type ID available, but have type name: ${currentStage.inspection_type}`);
        // We'll proceed without the ID and let the backend handle it
      } else {
        console.log('No inspection type information available in the current stage');
      }

      // Add application district if available
      if (selectedApplication) {
        const application = applications.find(app => app.id === selectedApplication);
        if (application && application.district) {
          params.district = application.district;
          console.log(`Adding district: ${application.district}`);
        }
      }

      console.log(`Making request to inspectors with params:`, params);

      const response = await get('inspectors', params)

      console.log('Response received:', response.data);

      if (response.data.data) {
        setAvailableInspector(response.data.data)
        toast.success('Available inspector found!')
      } else {
        setAvailableInspector(null)

        // Show the specific message from the backend if available
        let errorMessage = response.data.message || 'No available inspectors found for the selected date.'

        // Add more context if we have inspection type information
        if (currentStage && currentStage.inspection_type && !errorMessage.includes(currentStage.inspection_type)) {
          errorMessage = `No available inspectors found for ${currentStage.inspection_type} inspections on the selected date.`;
        }

        // Display a more detailed toast message
        toast.error(errorMessage, {
          duration: 6000, // Show for longer (6 seconds)
          style: { maxWidth: '500px' } // Make toast wider to fit longer messages
        })

        // Log more details for debugging
        console.log('No inspector found. Response:', response.data)

        // Also display the error in the UI
        setError(errorMessage)
      }
    } catch (error: any) {
      console.error('Error finding available inspector:', error)

      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        const errorMessage = error.response.data?.message ||
                            'Failed to find an available inspector. Please try again later.';
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        toast.error('No response received from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(`Error: ${error.message || 'Unknown error occurred'}`);
      }

      // Don't set a default inspector in case of error
      setAvailableInspector(null)
      toast.error('Unable to find an inspector. Please try again later.')
    } finally {
      setIsSearchingInspector(false)
    }
  }

  // Schedule inspection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedApplication || !scheduledDate || !scheduledTime || !availableInspector) {
      toast.error('Please fill in all required fields and find an available inspector')
      return
    }

    try {
      setLoading(true)

      // Prepare the data for the API call
      const scheduleData = {
        application_id: selectedApplication,
        inspector_id: availableInspector.inspector_id,
        stage_id: currentStage?.id || 1, // Include the stage_id from the current stage
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes: notes
      };

      console.log('Scheduling inspection with data:', scheduleData);

      const response = await post('inspection-schedules', scheduleData)

      toast.success('Inspection scheduled successfully!')

      // Update application status in ApplicationProcessLayout
      // This will trigger a refresh of the application flow visualization
      const appStatusEvent = new CustomEvent('applicationStatusUpdated', {
        detail: { inspectionScheduled: true }
      });
      window.dispatchEvent(appStatusEvent);

      // Wait a moment before redirecting to the next stage
      setTimeout(() => {
        const nextStageUrl = getNextStageUrl('inspection-scheduling');
        if (nextStageUrl) {
          toast.success('Proceeding to inspection stages...');
          router.push(nextStageUrl);
        }
      }, 2000);
    } catch (error: any) {
      console.error('Error scheduling inspection:', error)

      // Check if there's a specific error message from the backend
      let errorMessage = 'Failed to schedule inspection. Please try again later.'

      // Log detailed error information for debugging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }

      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;

        // If the error is about previous stage not being completed, show a more user-friendly message
        if (errorMessage.includes('Previous stage') && errorMessage.includes('must be completed')) {
          setError(errorMessage);
        }
      } else if (error.message) {
        // Use the error message directly if available
        errorMessage = `Error: ${error.message}`;
      }

      // Set the error state to display in the UI
      setError(errorMessage);

      toast.error(errorMessage, {
        duration: 6000, // Show for longer (6 seconds)
        style: { maxWidth: '500px' } // Make toast wider to fit longer messages
      })
    } finally {
      setLoading(false)
    }
  }

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <ApplicationProcessLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#224057]">Schedule Inspection</h1>
          <Link
            href="/applicant"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[#224057] mb-2">Schedule a New Inspection</h2>
              <p className="text-gray-600">
                Select an application and preferred date to schedule an inspection.
                Our system will automatically assign the most available inspector for your area.
              </p>
            </div>

            {/* Current Stage Information */}
            {currentStage && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-md font-medium text-blue-800 mb-2">Current Inspection Stage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Stage:</p>
                    <p className="font-medium">{currentStage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status:</p>
                    <p className="font-medium capitalize">{currentStage.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inspection Type:</p>
                    <p className="font-medium">{currentStage.inspection_type || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description:</p>
                    <p className="font-medium">{currentStage.description}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Note:</strong> The system will find an inspector specialized in this inspection type.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Application Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Application *
                </label>
                <select
                  value={selectedApplication}
                  onChange={(e) => {
                    const appId = e.target.value;
                    setSelectedApplication(appId);
                    fetchCurrentStage(appId);
                    setAvailableInspector(null); // Reset inspector when application changes
                  }}
                  required
                  disabled={applications.length === 0}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#224057] focus:border-[#224057]"
                >
                  {applications.length === 0 ? (
                    <option value="">No eligible applications available</option>
                  ) : (
                    applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.stand_number} - {app.status}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Date and Time Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value)
                      setAvailableInspector(null) // Reset inspector when date changes
                    }}
                    min={getMinDate()}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#224057] focus:border-[#224057]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time *
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#224057] focus:border-[#224057]"
                  >
                    <option value="">Select a time</option>
                    <option value="09:00:00">9:00 AM</option>
                    <option value="10:00:00">10:00 AM</option>
                    <option value="11:00:00">11:00 AM</option>
                    <option value="12:00:00">12:00 PM</option>
                    <option value="13:00:00">1:00 PM</option>
                    <option value="14:00:00">2:00 PM</option>
                    <option value="15:00:00">3:00 PM</option>
                    <option value="16:00:00">4:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Find Inspector Button */}
              <div>
                <button
                  type="button"
                  onClick={findAvailableInspector}
                  disabled={!scheduledDate || isSearchingInspector || !!error}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                >
                  {isSearchingInspector ? 'Searching...' : 'Find Available Inspector'}
                </button>
              </div>

              {/* Available Inspector Card */}
              {availableInspector && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-md font-medium text-green-800 mb-2">Available Inspector Found</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name:</p>
                      <p className="font-medium">{availableInspector.inspector_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Inspection Type:</p>
                      <p className="font-medium">{availableInspector.inspection_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">District:</p>
                      <p className="font-medium">{availableInspector.assigned_district}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-[#224057] focus:border-[#224057]"
                  placeholder="Any special instructions or information for the inspector..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !availableInspector || !!error}
                  className="px-6 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057] disabled:bg-gray-400"
                >
                  {loading ? 'Scheduling...' : 'Schedule Inspection'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </ApplicationProcessLayout>
  )
}

