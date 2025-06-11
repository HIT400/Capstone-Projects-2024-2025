'use client'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/Dashboardlayout'
import Link from 'next/link'
import { get } from '@/utils/api'
import { toast } from 'react-hot-toast'

interface Inspector {
  id: number
  user_id: number
  first_name: string
  last_name: string
  email: string
  password_hash?: string
  contact_number: string
  physical_address: string
  work_id: string
  license_number: string
  available: boolean
  assigned_district: string
  inspection_type: string
  created_at: string
  updated_at: string
}

export default function InspectorsTable() {
  const [inspectors, setInspectors] = useState<Inspector[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  // We no longer need the editInspector state since we're using a separate page

  // Fetch inspectors
  useEffect(() => {
    const fetchInspectors = async () => {
      try {
        // Use the new API utility function
        const response = await get('inspectors')
        const inspectorsData = response.data.data.inspectors || []

        // Map the response data to match our interface
        const mappedInspectors = inspectorsData.map((inspector: any) => ({
          id: inspector.user_id || inspector.id,
          user_id: inspector.user_id,
          first_name: inspector.first_name,
          last_name: inspector.last_name,
          email: inspector.email,
          password_hash: inspector.password_hash,
          contact_number: inspector.contact_number,
          physical_address: inspector.physical_address,
          work_id: inspector.work_id,
          license_number: inspector.license_number,
          available: inspector.available,
          assigned_district: inspector.assigned_district,
          inspection_type: inspector.inspection_type,
          created_at: inspector.created_at,
          updated_at: inspector.updated_at
        }))

        setInspectors(mappedInspectors)
        console.log('Fetched inspectors:', mappedInspectors)
      } catch (error) {
        console.error('Error fetching inspectors:', error)
        toast.error('Failed to load inspectors. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchInspectors()
  }, [])


  // Delete inspector
  const handleDelete = async (id: number) => {
    try {
      // Use the API utility for delete
      await get(`inspectors/${id}`, undefined, { method: 'DELETE' })
      setInspectors(inspectors.filter(inspector => inspector.id !== id))
      setDeleteConfirm(null)
      toast.success('Inspector deleted successfully')
    } catch (error) {
      console.error('Error deleting inspector:', error)
      toast.error('Failed to delete inspector. Please try again.')
    }
  }

  // We've moved the update functionality to the edit-inspector page

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = inspectors.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(inspectors.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) return (
    <DashboardLayout userRole="admin">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout userRole="admin">
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
    </DashboardLayout>
  )

  return (
    <DashboardLayout userRole="admin">
      <div className="bg-[#edf2f7] min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-xl rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#224057]">Building Inspectors</h2>
                  <p className="text-slate-500 mt-1">Manage inspector accounts and assignments</p>
                </div>
                <Link
                  href="/admin/add-inspector"
                  className="flex items-center gap-2 bg-[#224057] hover:bg-[#1a344d] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Inspector
                </Link>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr key="header-row">
                    <th key="header-id" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">ID</th>
                    <th key="header-name" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Name</th>
                    <th key="header-email" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Email</th>
                    <th key="header-password" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Password</th>
                    <th key="header-contact" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Contact</th>
                    <th key="header-work-id" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Work ID</th>
                    <th key="header-district" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">District</th>
                    <th key="header-inspection-type" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Inspection Type</th>
                    <th key="header-available" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Available</th>
                    <th key="header-created" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Created</th>
                    <th key="header-actions" className="px-6 py-3 text-left text-xs font-medium text-[#224057] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {currentItems.map((inspector) => (
                    <tr key={inspector.id}>
                      <td key={`id-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">{inspector.id}</td>
                      <td key={`name-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">
                        {inspector.first_name} {inspector.last_name}
                      </td>
                      <td key={`email-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">{inspector.email}</td>
                      <td key={`password-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">********</td>
                      <td key={`contact-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">{inspector.contact_number}</td>
                      <td key={`work-id-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">{inspector.work_id}</td>
                      <td key={`district-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">{inspector.assigned_district}</td>
                      <td key={`inspection-type-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">{inspector.inspection_type}</td>
                      <td key={`available-${inspector.id}`} className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          inspector.available
                            ? 'bg-green-500/20 text-green-900'
                            : 'bg-red-500/20 text-red-900'
                        }`}>
                          {inspector.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td key={`created-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-sm text-[#224057]">
                        {formatDate(inspector.created_at)}
                      </td>
                      <td key={`actions-${inspector.id}`} className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/edit-inspector/${inspector.id}`}
                          className="text-[#224057] hover:text-[#1a344d] mr-3 inline-block"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </Link>
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => setDeleteConfirm(inspector.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, inspectors.length)}
                </span> of{' '}
                <span className="font-medium">{inspectors.length}</span> inspectors
              </div>
              <div className="flex space-x-2">
                <button
                  key="prev-button"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#224057] text-white hover:bg-[#1a344d]'}`}
                >
                  Previous
                </button>
                {/* Add page number buttons */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={`page-${i + 1}`}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === i + 1 ? 'bg-[#224057] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  key="next-button"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages || totalPages === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#224057] text-white hover:bg-[#1a344d]'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* We've moved the edit form to a separate page */}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div key="delete-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium text-[#224057] mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this inspector? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057]"
                    onClick={() => setDeleteConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => handleDelete(deleteConfirm)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}