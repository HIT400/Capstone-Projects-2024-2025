'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import ApplicationProcessLayout from '@/components/ApplicationProcessLayout'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/context/AuthContext'

interface Certificate {
  id: string
  application_id: string
  certificate_number: string
  issue_date: string
  expiry_date: string
  status: string
  stand_number: string
  owner_name: string
}

export default function CertificatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [error, setError] = useState('')

  // Fetch certificate for the user's application
  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        // First, get the user's most recent application
        const applicationsResponse = await axios.get(
          'http://localhost:5001/api/application-stages/user/applications',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (applicationsResponse.data.data && applicationsResponse.data.data.length > 0) {
          const application = applicationsResponse.data.data[0]

          // Now fetch certificate for this application
          try {
            const certificateResponse = await axios.get(
              `http://localhost:5001/api/certificates/application/${application.id}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            )

            if (certificateResponse.data.data) {
              setCertificate(certificateResponse.data.data)
            } else {
              // If no certificate exists yet, create a placeholder
              setCertificate({
                id: 'pending',
                application_id: application.id,
                certificate_number: 'Pending',
                issue_date: new Date().toISOString(),
                expiry_date: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString(),
                status: 'pending',
                stand_number: application.stand_number,
                owner_name: application.owner_name || user?.firstName + ' ' + user?.lastName
              })
            }
          } catch (certError) {
            console.error('Error fetching certificate:', certError)
            setError('Certificate is being processed. Please check back later.')
          }
        } else {
          setError('No applications found. Please submit an application first.')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load certificate data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificate()
  }, [user])

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <ApplicationProcessLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#224057]">Building Certificate</h1>
            <p className="text-gray-600 mt-1">
              Your official certificate of occupancy
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#224057] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading certificate...</p>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          ) : certificate ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              {/* Certificate Header */}
              <div className="bg-[#224057] text-white p-6 text-center">
                <div className="mb-2">
                  <h2 className="text-2xl font-bold uppercase">Certificate of Occupancy</h2>
                  <p className="text-sm opacity-80">City of Bulawayo</p>
                </div>
                <div className="flex justify-center">
                  <div className="px-4 py-1 bg-white text-[#224057] rounded-full text-sm font-bold">
                    {certificate.status === 'pending' ? 'PENDING APPROVAL' : 'OFFICIAL DOCUMENT'}
                  </div>
                </div>
              </div>

              {/* Certificate Body */}
              <div className="p-8">
                <div className="mb-8 text-center">
                  <p className="text-gray-600 mb-2">This is to certify that the building located at:</p>
                  <h3 className="text-xl font-bold text-[#224057]">Stand Number: {certificate.stand_number}</h3>
                  <p className="text-gray-800 mt-1">Has been inspected and approved for occupancy</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Certificate Details</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Certificate Number:</span>
                        <span className="block text-lg font-semibold text-gray-900">
                          {certificate.certificate_number}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Issue Date:</span>
                        <span className="block text-gray-900">
                          {certificate.status === 'pending' ? 'Pending' : formatDate(certificate.issue_date)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Expiry Date:</span>
                        <span className="block text-gray-900">
                          {certificate.status === 'pending' ? 'Pending' : formatDate(certificate.expiry_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Owner Information</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Owner Name:</span>
                        <span className="block text-lg font-semibold text-gray-900">
                          {certificate.owner_name}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-medium text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          certificate.status === 'active' ? 'bg-green-100 text-green-800' :
                          certificate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {certificate.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {certificate.status === 'pending' ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Your certificate is being processed. Once approved, you will be able to download the official document.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => toast.success('Certificate downloaded successfully!')}
                      className="px-6 py-3 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057] flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Certificate
                    </button>
                  </div>
                )}
              </div>

              {/* Certificate Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                  <p>This certificate is issued in accordance with the Building By-laws of the City of Bulawayo.</p>
                  <p className="mt-2 md:mt-0">Ref: {certificate.application_id}</p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              For any inquiries regarding your certificate, please contact the Building Department.
            </p>
          </div>
        </div>
      </div>
    </ApplicationProcessLayout>
  )
}