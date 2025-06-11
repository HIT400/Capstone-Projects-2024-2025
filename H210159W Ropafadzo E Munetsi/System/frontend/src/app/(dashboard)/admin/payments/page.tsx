'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import DashboardLayout from '@/components/Dashboardlayout';
import { useAuth } from '@/context/AuthContext';

interface Payment {
  id: string;
  application_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  reference_number: string;
  created_at: string;
  stand_number: string;
  email: string;
  first_name: string;
  last_name: string;
  invoice_file_name: string;
}

const AdminPaymentsPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Fetch all payments
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        try {
          const response = await axios.get('http://localhost:5001/api/payments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (response.data.data) {
            setPayments(response.data.data);
          }
        } catch (apiError) {
          console.error('Error fetching payments from API:', apiError);
          toast.error('Failed to load payments. Please try again later.');
          setPayments([]);
        }
      } catch (error) {
        console.error('Error in payment fetching process:', error);
        toast.error('Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status: string | any) => {
    // Handle non-string values
    if (typeof status !== 'string') {
      return 'bg-gray-100 text-gray-800';
    }

    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle payment status update
  const updatePaymentStatus = async (id: string, status: string) => {
    setProcessingAction(true);

    try {
      const token = localStorage.getItem('token');

      try {
        await axios.put(`http://localhost:5001/api/payments/${id}/status`,
          { status },
          { headers: { 'Authorization': `Bearer ${token}` }}
        );
        toast.success(`Payment marked as ${status}`);
      } catch (apiError) {
        console.error('Error updating payment status via API:', apiError);
        toast.error('Failed to update payment status. Please try again later.');
        throw apiError; // Re-throw to prevent local state update
      }

      // Update local state regardless of API success
      setPayments(payments.map(payment =>
        payment.id === id ? { ...payment, payment_status: status } : payment
      ));

      setShowModal(false);
    } catch (error) {
      console.error('Error in payment status update process:', error);
      toast.error('Failed to update payment status');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle invoice download
  const downloadInvoice = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`http://localhost:5001/api/payments/${id}/invoice`, {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        });

        // Create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Get the payment to use its filename
        const payment = payments.find(p => p.id === id);
        const fileName = payment && payment.invoice_file_name && typeof payment.invoice_file_name === 'string'
          ? payment.invoice_file_name
          : `invoice-${id}.pdf`;
        link.setAttribute('download', fileName);

        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (apiError) {
        console.error('Error downloading invoice from API:', apiError);
        toast.error('Failed to download invoice. Please try again later.');
      }
    } catch (error) {
      console.error('Error in invoice download process:', error);
      toast.error('Failed to download invoice');
    }
  };

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-[#224057] mb-6">Payment Management</h1>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-[#224057] mb-4">All Payments</h2>

          {loading ? (
            <p className="text-center py-4">Loading payments...</p>
          ) : payments.length === 0 ? (
            <p className="text-center py-4 text-gray-500">No payment records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.first_name} {payment.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.stand_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${typeof payment.amount === 'number' ? payment.amount.toFixed(2) : parseFloat(payment.amount || '0').toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {typeof payment.payment_method === 'string' ? payment.payment_method.replace('_', ' ') : payment.payment_method || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.payment_status)}`}>
                          {typeof payment.payment_status === 'string'
                            ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)
                            : payment.payment_status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {(typeof payment.payment_status === 'string' && payment.payment_status.toLowerCase() === 'pending') && (
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Verify
                            </button>
                          )}

                          {payment.invoice_file_name && typeof payment.invoice_file_name === 'string' && (
                            <button
                              onClick={() => downloadInvoice(payment.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Download Invoice
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Payment Verification Modal */}
      {showModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[#224057] mb-4">
              Verify Payment
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Application:</span> {selectedPayment.stand_number}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Applicant:</span> {selectedPayment.first_name} {selectedPayment.last_name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Amount:</span> ${typeof selectedPayment.amount === 'number' ? selectedPayment.amount.toFixed(2) : parseFloat(selectedPayment.amount || '0').toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Method:</span> {typeof selectedPayment.payment_method === 'string' ? selectedPayment.payment_method.replace('_', ' ') : selectedPayment.payment_method || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Reference:</span> {selectedPayment.reference_number || 'N/A'}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={processingAction}
              >
                Cancel
              </button>
              <button
                onClick={() => updatePaymentStatus(selectedPayment.id, 'failed')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={processingAction}
              >
                Reject
              </button>
              <button
                onClick={() => updatePaymentStatus(selectedPayment.id, 'completed')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={processingAction}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPaymentsPage;
