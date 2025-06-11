'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Dashboardlayout'
import { get, put } from '@/utils/api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface Schedule {
  id: string
  application_id: string
  inspector_id: string
  scheduled_date: string
  scheduled_time: string
  status: string
  notes: string
  created_at: string
  updated_at: string
  owner_name: string
  stand_number: string
  email: string
  contact_number: string
}

export default function InspectorSchedulesPage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [filteredSchedules, setFilteredSchedules] = useState<Schedule[]>([])
  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false)
  const [isAvailable, setIsAvailable] = useState(true)

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true)

        // Validate user ID before making the API call
        if (!user?.id) {
          console.warn('Cannot fetch schedules: User ID is missing')
          setError('User information is not available. Please try logging in again.')
          setLoading(false)
          return
        }

        // Log the user ID for debugging
        console.log(`Fetching schedules for inspector ID: ${user.id}`)

        // Fetch schedules for this inspector
        const response = await get(`inspection-schedules/inspector/${user.id}`)

        if (response.data?.data) {
          setSchedules(Array.isArray(response.data.data) ? response.data.data : [])
        } else {
          setError('No schedules found.')
        }
      } catch (error) {
        console.error('Error fetching schedules:', error)
        toast.error('Failed to load schedules. Please try again later.')
        setError('Failed to load schedules. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    // Also fetch inspector availability
    const fetchInspectorAvailability = async () => {
      try {
        // Validate user ID before making the API call
        if (!user?.id) {
          console.warn('Cannot fetch inspector availability: User ID is missing')
          return
        }

        // Log the user ID for debugging
        console.log(`Fetching availability for inspector ID: ${user.id}`)

        const response = await get(`inspectors/${user.id}`)

        // Improved validation with more detailed logging
        if (response.data?.data) {
          if (typeof response.data.data === 'object' &&
              response.data.data !== null &&
              'inspector' in response.data.data &&
              typeof response.data.data.inspector === 'object' &&
              response.data.data.inspector !== null &&
              'available' in response.data.data.inspector) {
            setIsAvailable(response.data.data.inspector.available as boolean)
          } else {
            console.warn('Inspector availability data has unexpected structure:', response.data.data)
          }
        } else {
          console.warn('No inspector data returned from API')
        }
      } catch (error) {
        console.error('Error fetching inspector availability:', error)
      }
    }

    // Only fetch data if user is loaded and has an ID
    if (user?.id) {
      fetchSchedules()
      fetchInspectorAvailability()
    } else {
      // If no user ID, set appropriate loading/error state
      setLoading(false)
      setError('Please log in to view your schedule.')
    }
  }, [user])

  // Filter schedules when selectedDate or schedules change
  useEffect(() => {
    if (selectedDate && schedules.length > 0) {
      const filtered = schedules.filter(schedule =>
        schedule.scheduled_date === selectedDate
      )
      setFilteredSchedules(filtered)
    } else {
      setFilteredSchedules([])
    }
  }, [selectedDate, schedules])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value)
  }

  const updateAvailability = async () => {
    // Enhanced validation for user ID
    if (!user?.id) {
      console.warn('Cannot update availability: User ID is missing')
      toast.error('User information is not available. Please try logging in again.')
      return
    }

    try {
      setIsUpdatingAvailability(true)

      // Log the request for debugging
      console.log(`Updating availability for inspector ID: ${user.id} to ${!isAvailable}`)

      const response = await put(`inspectors/inspector/${user.id}`, {
        available: !isAvailable
      })

      // Improved response validation
      if (response.data?.data) {
        setIsAvailable(!isAvailable)
        toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'} for inspections`)
      } else {
        console.warn('Unexpected response format when updating availability:', response.data)
        toast.warning('Availability updated, but the response was unexpected. Please verify your status.')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      toast.error('Failed to update availability. Please try again later.')
    } finally {
      setIsUpdatingAvailability(false)
    }
  }

  // Group schedules by time
  const groupedSchedules = filteredSchedules.reduce<Record<string, Schedule[]>>((acc, schedule) => {
    const time = schedule.scheduled_time
    if (!acc[time]) {
      acc[time] = []
    }
    acc[time].push(schedule)
    return acc
  }, {})

  // Sort times
  const sortedTimes = Object.keys(groupedSchedules).sort()

  return (
    <DashboardLayout userRole="inspector">
      <div className="bg-[#edf2f7] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-6">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#224057]">Inspection Schedule</h2>
                  <p className="text-slate-500 mt-1">Manage your inspection schedule</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="mr-2 text-sm font-medium text-gray-700">Availability:</span>
                    <button
                      onClick={updateAvailability}
                      disabled={isUpdatingAvailability}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#224057] focus:ring-offset-2 ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
                    >
                      <span className="sr-only">Toggle availability</span>
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAvailable ? 'translate-x-5' : 'translate-x-0'}`}
                      />
                    </button>
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224057] mx-auto"></div>
                <p className="mt-4 text-slate-500">Loading schedule...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredSchedules.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-500">No inspections scheduled for {new Date(selectedDate).toLocaleDateString()}.</p>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Schedule for {new Date(selectedDate).toLocaleDateString()}
                </h3>

                <div className="space-y-6">
                  {sortedTimes.map(time => (
                    <div key={time} className="border-l-4 border-[#224057] pl-4">
                      <h4 className="text-md font-medium text-gray-900 mb-2">{time}</h4>
                      <div className="space-y-4">
                        {groupedSchedules[time].map(schedule => (
                          <div key={schedule.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium text-gray-900">
                                {schedule.stage_name ? `${schedule.stage_name} - ${schedule.owner_name}` : schedule.owner_name}
                              </h5>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full
                                ${schedule.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                  schedule.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'}`}>
                                {schedule.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Stand Number: {schedule.stand_number}</p>
                              <p className="mt-1">Contact: {schedule.contact_number}</p>
                              {schedule.notes && (
                                <p className="mt-1">Notes: {schedule.notes}</p>
                              )}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <button
                                className="px-3 py-1 text-xs bg-[#224057] text-white rounded hover:bg-[#1a344a] transition-colors"
                                onClick={() => window.location.href = `/inspector/inspections?applicationId=${schedule.application_id}`}
                              >
                                View Inspection
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
