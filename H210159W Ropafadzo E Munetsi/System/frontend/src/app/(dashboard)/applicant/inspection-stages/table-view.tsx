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

  return (
    <div className="bg-[#edf2f7] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-6">
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
                  {inspectionStages.map((stage, index) => {
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
                            {stage.status === 'scheduled' || stage.status === 'completed'
                              ? formatDate(stage.date)
                              : 'Not scheduled'}
                          </div>
                          {stage.schedule && (
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
      </div>
    </div>
  )
}
