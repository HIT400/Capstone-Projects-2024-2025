'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Dashboardlayout'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { post } from '@/utils/api'
import DistrictSelect from '@/components/DistrictSelect'

export default function AddInspectorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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
    available: true
  })

  // For debugging - log the schema requirements
  useEffect(() => {
    console.log('Inspector schema requirements:')
    console.log('- Users table: email, password_hash, role, first_name, last_name, contact_number, physical_address, national_id_number')
    console.log('- Inspectors table: user_id, work_id, license_number, available, assigned_district, inspection_type')
  }, [])

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
    setLoading(true)

    try {
      // Simplified approach - create a minimal inspector object with only the required fields
      const minimalInspectorData = {
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_number: formData.contact_number,
        physical_address: formData.physical_address,
        national_id_number: formData.national_id_number,
        work_id: formData.work_id,
        assigned_district: formData.assigned_district || 'Harare Central',
        inspection_type: formData.inspection_type || 'General',
        license_number: formData.license_number || '',
        available: true
      }

      // Basic validation
      if (!minimalInspectorData.email || !minimalInspectorData.password || !minimalInspectorData.work_id) {
        toast.error('Email, password, and work ID are required')
        setLoading(false)
        return
      }

      console.log('Simplified data being submitted:', minimalInspectorData)

      // Use the new API utility function
      const response = await post('inspectors', minimalInspectorData)

      console.log('Inspector created successfully:', response.data)
      toast.success('Inspector added successfully')
      router.push('/admin/inspectors')
    } catch (error: any) {
      console.error('Error adding inspector:', error)

      // Direct console logging of the entire error object
      console.error('FULL ERROR OBJECT:', error)

      // More detailed error logging
      if (error.response) {
        console.error('Error response data:', error.response.data)
        console.error('Error response status:', error.response.status)
        console.error('Error response headers:', error.response.headers)

        // Try to extract the error message
        let errorMessage = 'Failed to add inspector'
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data && typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data)
        }

        toast.error(errorMessage)

        // Alert with more details for debugging
        alert(`Error: ${errorMessage}\n\nStatus: ${error.response.status}\n\nPlease check the console for more details.`)
      } else if (error.request) {
        console.error('No response received:', error.request)
        toast.error('No response from server. Please try again.')
      } else {
        console.error('Error setting up request:', error.message)
        toast.error('Error setting up request: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen bg-blueGray-50">
        {/* Form Container */}
        <div className="w-full p-6">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-6 py-6">
              <div className="text-center flex justify-between">
                <h6 className="text-[#224057] text-xl font-bold">
                  Add New Inspector
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
                    disabled={loading}
                    className="bg-[#224057] text-white active:bg-[#1a3045] font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                    onClick={handleSubmit}
                  >
                    {loading ? 'Adding...' : 'Add Inspector'}
                  </button>
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> Admin and superadmin users cannot be inspectors. If you try to create an inspector with an email that belongs to an admin or superadmin user, the operation will fail.
                </p>
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
                        Password *
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-[#224057] bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
      </div>
    </DashboardLayout>
  )
}