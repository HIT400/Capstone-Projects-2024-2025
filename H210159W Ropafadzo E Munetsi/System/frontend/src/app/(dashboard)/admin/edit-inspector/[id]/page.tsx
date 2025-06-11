'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Dashboardlayout'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { get } from '@/utils/api'
import DistrictSelect from '@/components/DistrictSelect'

interface Inspector {
  id: number
  first_name: string
  last_name: string
  email: string
  password: string
  contact_number: string
  physical_address: string
  national_id_number: string
  work_id: string
  license_number: string
  available: boolean
  assigned_district: string
  inspection_type: string
  created_at: string
  updated_at: string
  contact?: string // For backward compatibility
}

export default function EditInspectorPage({ params }: { params: { id: string } }) {
  // Access params directly
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<Inspector>({
    id: 0,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    contact_number: '',
    physical_address: '',
    national_id_number: '',
    work_id: '',
    license_number: '',
    assigned_district: '',
    inspection_type: '',
    available: true,
    created_at: '',
    updated_at: ''
  })

  // Fetch inspector data
  useEffect(() => {
    const fetchInspector = async () => {
      try {
        setLoading(true)
        console.log('Fetching inspector with ID:', params.id)

        // Fetch inspector data from the API
        const response = await get(`inspectors/${params.id}`)

        if (response.data?.data?.inspector) {
          const inspectorData = response.data.data.inspector
          console.log('Fetched inspector data:', inspectorData)

          // Map the API response to our form data structure
          setFormData({
            id: inspectorData.user_id || parseInt(params.id),
            first_name: inspectorData.first_name || '',
            last_name: inspectorData.last_name || '',
            email: inspectorData.email || '',
            password: '', // Password is not returned from the API for security
            contact_number: inspectorData.contact_number || '',
            physical_address: inspectorData.physical_address || '',
            national_id_number: inspectorData.national_id_number || '',
            work_id: inspectorData.work_id || '',
            license_number: inspectorData.license_number || '',
            assigned_district: inspectorData.assigned_district || '',
            inspection_type: inspectorData.inspection_type || '',
            available: inspectorData.available !== undefined ? inspectorData.available : true,
            created_at: inspectorData.created_at || '',
            updated_at: inspectorData.updated_at || ''
          })

          toast.success('Inspector data loaded successfully')
        } else {
          console.warn('No inspector data found for ID:', params.id)

          // Set the ID from the URL for a new form
          setFormData(prev => ({
            ...prev,
            id: parseInt(params.id) || 0
          }))

          // Show a message to the user
          toast('Please fill in the inspector details and save to create/update the inspector.', {
            icon: '📝',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
            duration: 5000
          })
        }

      } catch (error) {
        console.error('Error fetching inspector data:', error)
        toast.error('Failed to load inspector data. Please try again.')

        // Set the ID from the URL for a new form
        setFormData(prev => ({
          ...prev,
          id: parseInt(params.id) || 0
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchInspector()
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData({
        ...formData,
        [name]: checkbox.checked
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Basic validation
      if (!formData.first_name || !formData.last_name || !formData.email) {
        toast.error('First name, last name, and email are required')
        setSubmitting(false)
        return
      }

      // Prepare the data for update
      const updateData = {
        // User fields
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,

        // Only include password if it's provided (not empty)
        ...(formData.password ? { password: formData.password } : {}),

        // Contact information
        contact_number: formData.contact_number,
        physical_address: formData.physical_address,
        national_id_number: formData.national_id_number,

        // Inspector specific fields
        work_id: formData.work_id,
        license_number: formData.license_number,
        assigned_district: formData.assigned_district,
        inspection_type: formData.inspection_type,
        available: formData.available
      }

      console.log('Updating inspector with ID:', formData.id)
      console.log('Update data:', updateData)

      // Use the API utility for update
      // The correct endpoint is /api/inspectors/:id
      const response = await get(`inspectors/${formData.id}`, undefined, {
        method: 'PUT',
        data: updateData
      })

      console.log('Update response:', response)
      toast.success('Inspector updated successfully')
      router.push('/admin/inspectors')
    } catch (error: any) {
      console.error('Error in form submission:', error)

      // Provide more detailed error message if available
      if (error.response?.data?.message) {
        toast.error(`Failed to update inspector: ${error.response.data.message}`)
      } else {
        toast.error('An error occurred. Please try again.')
      }

      // Log the error details for debugging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data)
      } else if (error.request) {
        console.error('No response received')
      } else {
        console.error('Error message:', error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen bg-blueGray-50">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
          </div>
        ) : (
          <div className="w-full p-6">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                  <h6 className="text-[#224057] text-xl font-bold">
                    Edit Inspector
                  </h6>
                  <div className="flex space-x-2">
                    <Link
                      href="/admin/inspectors"
                      className="bg-gray-200 text-gray-700 active:bg-gray-300 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                    >
                      Cancel
                    </Link>
                    <button
                      type="button"
                      disabled={submitting}
                      className="bg-[#224057] text-white active:bg-[#1a3045] font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                      onClick={handleSubmit}
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form onSubmit={(e) => e.preventDefault()}>
                  <h6 className="text-[#224057] text-sm mt-3 mb-6 font-bold uppercase">
                    Personal Information
                  </h6>
                  <div className="flex flex-wrap">
                    {/* First Name */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Password <span className="text-xs font-normal">(Leave blank to keep current password)</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Enter new password or leave blank"
                        />
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Contact Number *
                        </label>
                        <input
                          type="text"
                          name="contact_number"
                          value={formData.contact_number}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* National ID Number */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          National ID Number *
                        </label>
                        <input
                          type="text"
                          name="national_id_number"
                          value={formData.national_id_number}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* Physical Address */}
                    <div className="w-full px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Physical Address *
                        </label>
                        <textarea
                          name="physical_address"
                          value={formData.physical_address}
                          onChange={handleChange}
                          required
                          rows={3}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                  </div>

                  <hr className="mt-6 border-b-1 border-blueGray-300" />

                  <h6 className="text-[#224057] text-sm mt-3 mb-6 font-bold uppercase">
                    Professional Information
                  </h6>
                  <div className="flex flex-wrap">
                    {/* Work ID */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Work ID *
                        </label>
                        <input
                          type="text"
                          name="work_id"
                          value={formData.work_id}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>

                    {/* License Number */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          name="license_number"
                          value={formData.license_number}
                          onChange={handleChange}
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>



                    {/* Assigned District */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Assigned District *
                        </label>
                        <DistrictSelect
                          name="assigned_district"
                          value={formData.assigned_district}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    {/* Inspection Type */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-[#224057] text-xs font-bold mb-2">
                          Inspection Type *
                        </label>
                        <select
                          name="inspection_type"
                          value={formData.inspection_type}
                          onChange={handleChange}
                          required
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        >
                          <option key="select-inspection" value="">Select Inspection Type</option>
                          <option key="foundation" value="Foundation">Foundation</option>
                          <option key="structural-inspection" value="Structural">Structural</option>
                          <option key="final" value="Final">Final</option>
                          <option key="general-inspection" value="General">General</option>
                        </select>
                      </div>
                    </div>

                    {/* Available for Assignments */}
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <div className="flex items-center mt-8">
                          <input
                            type="checkbox"
                            name="available"
                            checked={formData.available}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#224057] focus:ring-[#224057] border-gray-300 rounded"
                          />
                          <label className="ml-2 block text-sm font-medium text-gray-700">
                            Available for Assignments
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
