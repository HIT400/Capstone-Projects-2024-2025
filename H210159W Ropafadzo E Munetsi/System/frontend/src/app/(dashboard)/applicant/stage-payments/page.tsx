'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from '@/utils/toast';
import ApplicationProcessLayout from '@/components/ApplicationProcessLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import PaynowTestMode from '@/components/PaynowTestMode';
import { getNextStageUrl } from '@/utils/applicationFlow';

interface Application {
  id: string;
  stand_number: string;
  status: string;
  owner_name: string;
  project_description: string;
  document_approval_date?: string;
  current_stage_name?: string;
}

interface StagePayment {
  id: string;
  application_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  reference_number: string;
  created_at: string;
  payment_type: string;
  stage_name?: string;
  paynow_poll_url?: string;
}

interface PaynowResponse {
  redirectUrl: string;
  pollUrl: string;
  instructions?: string;
}

const StagePaymentsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [approvedApplications, setApprovedApplications] = useState<Application[]>([]);
  const [stagePayments, setStagePayments] = useState<StagePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('paynow');
  const [amount, setAmount] = useState<string>('170.00');
  const [notes, setNotes] = useState<string>('');
  const [stageDescription, setStageDescription] = useState<string>('All Inspection Stages');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [noApprovedApplications, setNoApprovedApplications] = useState(false);
  const [phone, setPhone] = useState<string>('');
  const [mobileMethod, setMobileMethod] = useState<string>('ecocash');
  const [showPaynowModal, setShowPaynowModal] = useState(false);
  const [paynowResponse, setPaynowResponse] = useState<PaynowResponse | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get status color for payment status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fetch approved applications and stage payments
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        setLoading(true);

        try {
          // Fetch applications that have approved documents
          const applicationsResponse = await axios.get('http://localhost:5001/api/application-stages/user/applications', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (applicationsResponse.data.data && applicationsResponse.data.data.length > 0) {
            // Filter applications that have approved documents
            const approved = applicationsResponse.data.data.filter(
              (app: Application) => app.status === 'approved' ||
                                   (app.current_stage_name &&
                                    app.current_stage_name.toLowerCase().includes('inspection'))
            );

            if (approved.length > 0) {
              setApprovedApplications(approved);
              setSelectedApplication(approved[0].id);
              setNoApprovedApplications(false);
            } else {
              setNoApprovedApplications(true);
              setApprovedApplications([]);
            }
          } else {
            setNoApprovedApplications(true);
            setApprovedApplications([]);
          }
        } catch (appError) {
          console.error('Error fetching approved applications:', appError);
          toast.error('Could not fetch your approved applications. Please try again later.');
          setApprovedApplications([]);
        }

        try {
          // Fetch stage payments
          const paymentsResponse = await axios.get('http://localhost:5001/api/payments/user', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { payment_type: 'stage' }
          });

          if (paymentsResponse.data.data) {
            // Filter only stage payments
            const stagePaymentsData = paymentsResponse.data.data.filter(
              (payment: any) => payment.payment_type === 'stage'
            );
            setStagePayments(stagePaymentsData);

            // Check if any payment is completed
            const completedPayment = stagePaymentsData.find(
              (payment: any) => payment.payment_status === 'completed'
            );
            if (completedPayment) {
              setPaymentCompleted(true);
            }
          }
        } catch (payError) {
          console.error('Error fetching stage payments:', payError);
          toast.error('Could not fetch your stage payment history. Please try again later.');
          setStagePayments([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle file change for invoice upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setInvoiceFile(e.target.files[0]);
    }
  };

  // Handle PayNow payment initiation
  const initiatePaynowPayment = async (isWebPayment: boolean) => {
    try {
      const token = localStorage.getItem('token');
      // Amount is fixed at 170.00
      const numericAmount = 170.00;

      // Stage description is now set by default to "All Inspection Stages"

      setSubmitting(true);

      const paymentData: any = {
        applicationId: selectedApplication,
        amount: numericAmount,
        email: user?.email,
        description: `Stage Payment for All Inspection Stages - Application #${selectedApplication}`,
        paymentType: 'stage',
        stageDescription: stageDescription,
        isMobile: !isWebPayment
      };

      // Add mobile payment specific fields
      if (!isWebPayment) {
        paymentData.phone = phone;
        paymentData.method = mobileMethod;
      }

      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Initiating payment with data:', paymentData);
      }

      const response = await axios.post(
        'http://localhost:5001/api/payments/paynow/initiate',
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 201 && response.data.data) {
        setPaynowResponse(response.data.data.paynow);
        setShowPaynowModal(true);

        // For web payments, open the payment URL in a new tab
        if (isWebPayment && response.data.data.paynow.redirectUrl) {
          window.open(response.data.data.paynow.redirectUrl, '_blank');
        }

        // Start polling for payment status
        if (response.data.data.payment && response.data.data.payment.id) {
          pollPaymentStatus(response.data.data.payment.id);
        }

        // Reset form
        setAmount('');
        setNotes('');
        setStageDescription('');
        setInvoiceFile(null);
        setPhone('');
      } else {
        toast.error('Failed to initiate PayNow payment');
      }
    } catch (error: any) {
      // Only log detailed errors in development environment
      if (process.env.NODE_ENV === 'development') {
        console.error('Error initiating PayNow payment:', error);
      } else {
        console.error('Error initiating PayNow payment');
      }

      // Get more specific error message if available
      let errorMessage = 'Failed to initiate PayNow payment. Please try again.';

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 404) {
          errorMessage = 'Payment service not found. Please try again later.';
        } else if (error.response.status === 400) {
          if (error.response.data && error.response.data.message) {
            errorMessage = `Payment error: ${error.response.data.message}`;
          } else {
            errorMessage = 'Invalid payment request. Please check your payment details.';
          }
        } else if (error.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.response.status === 500) {
          errorMessage = 'Payment server error. Please try again later.';
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from payment server. Please check your internet connection.';
      }

      toast.error(errorMessage);
      setSubmitting(false);
    }
  };

  // Poll payment status
  const pollPaymentStatus = async (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 24; // Poll for up to 2 minutes (5 seconds * 24)
    const pollInterval = 5000; // 5 seconds - more frequent at the beginning
    let errorCount = 0;
    const maxErrors = 3; // Stop polling after 3 consecutive errors

    // Adaptive polling - increase interval as time passes
    const getPollingInterval = (attemptNumber: number) => {
      // Start with 5 seconds, then gradually increase
      if (attemptNumber < 6) return 5000; // First 30 seconds: check every 5 seconds
      if (attemptNumber < 12) return 10000; // Next 60 seconds: check every 10 seconds
      return 15000; // After 90 seconds: check every 15 seconds
    }

    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        setCheckingStatus(false);
        toast.warning('Payment status check timed out. Please check your payment status in your payment history.');
        return;
      }

      setCheckingStatus(true);
      attempts++;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:5001/api/payments/paynow/status/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        // Reset error count on successful request
        errorCount = 0;

        // Only log in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('Payment status response:', response.data);
        }

        if (response.data.data && response.data.data.status === 'completed') {
          toast.success('Payment completed successfully!');
          setShowPaynowModal(false);
          setCheckingStatus(false);
          setPaymentCompleted(true); // Mark payment as completed

          // Refresh payments list
          try {
            const paymentsResponse = await axios.get('http://localhost:5001/api/payments/user', {
              headers: { 'Authorization': `Bearer ${token}` },
              params: { payment_type: 'stage' }
            });

            if (paymentsResponse.data.data) {
              const stagePaymentsData = paymentsResponse.data.data.filter(
                (payment: any) => payment.payment_type === 'stage'
              );
              setStagePayments(stagePaymentsData);
            }

            // Update application status in ApplicationProcessLayout
            // This will trigger a refresh of the application flow visualization
            const appStatusEvent = new CustomEvent('applicationStatusUpdated', {
              detail: { paymentCompleted: true, paymentType: 'stage' }
            });
            window.dispatchEvent(appStatusEvent);

            // Navigate to the next stage after a short delay
            setTimeout(() => {
              const nextStageUrl = getNextStageUrl('stage-payments');
              if (nextStageUrl) {
                toast.success('Proceeding to inspection scheduling...');
                router.push(nextStageUrl);
              }
            }, 2000);

            return;
          } catch (refreshError) {
            console.error('Error refreshing payments:', refreshError);
          }
        } else if (response.data.data && response.data.data.status === 'failed') {
          toast.error('Payment failed');
          setShowPaynowModal(false);
          setCheckingStatus(false);
          return;
        } else if (response.data.data && response.data.data.status === 'pending') {
          // Payment is still pending, continue polling
          setTimeout(checkStatus, getPollingInterval(attempts));
        } else {
          // Unknown status or missing data
          errorCount++;
          if (errorCount >= maxErrors) {
            toast.error('Unable to determine payment status. Please check your payment history.');
            setShowPaynowModal(false);
            setCheckingStatus(false);
            return;
          }
          setTimeout(checkStatus, getPollingInterval(attempts));
        }
      } catch (error: any) {
        // Only log detailed errors in development environment
        if (process.env.NODE_ENV === 'development') {
          console.error('Error checking payment status:', error);
        } else {
          console.error('Error checking payment status');
        }

        // Increment error count
        errorCount++;

        // If we've had too many consecutive errors, stop polling
        if (errorCount >= maxErrors) {
          // Get more specific error message if available
          let errorMessage = 'Error checking payment status. Please check your payment history.';

          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
              errorMessage = 'Payment not found. Please check your payment history.';
            } else if (error.response.status === 400) {
              if (error.response.data && error.response.data.message) {
                errorMessage = `Payment error: ${error.response.data.message}`;
              } else {
                errorMessage = 'Invalid payment request. Please try again.';
              }
            } else if (error.response.status === 401) {
              errorMessage = 'Authentication error. Please log in again.';
            } else if (error.response.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }
          } else if (error.request) {
            // The request was made but no response was received
            errorMessage = 'No response from server. Please check your internet connection.';
          }

          toast.error(errorMessage);
          setShowPaynowModal(false);
          setCheckingStatus(false);
          return;
        }

        // Continue polling despite the error
        setTimeout(checkStatus, getPollingInterval(attempts));
      }
    };

    // Start polling
    checkStatus();
  };

  // Close PayNow modal
  const closePaynowModal = () => {
    setShowPaynowModal(false);
    setPaynowResponse(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApplication) {
      toast.error('Please select an application');
      return;
    }

    // Amount is fixed at 170.00
    // No need to validate

    // Stage description is now set by default to "All Inspection Stages"

    // Validate payment method specific requirements
    if (paymentMethod === 'cash' && !invoiceFile) {
      toast.error('Please upload a receipt for cash payments');
      return;
    }

    // Reference number is now auto-generated on the server

    if (paymentMethod === 'paynow_mobile' && !phone) {
      toast.error('Please enter your mobile number for PayNow mobile payments');
      return;
    }

    // Handle PayNow payments differently
    if (paymentMethod === 'paynow') {
      initiatePaynowPayment(true);
      return;
    }

    if (paymentMethod === 'paynow_mobile') {
      initiatePaynowPayment(false);
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('token');

    const formData = new FormData();
    formData.append('applicationId', selectedApplication);
    formData.append('amount', amount);
    formData.append('paymentMethod', paymentMethod);
    formData.append('notes', notes);
    formData.append('paymentType', 'stage');
    formData.append('stageDescription', stageDescription);

    if (invoiceFile) {
      formData.append('invoice', invoiceFile);
    }

    try {
      const response = await axios.post('http://localhost:5001/api/payments', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Stage payment submitted successfully');

      // Refresh payments list
      try {
        const paymentsResponse = await axios.get('http://localhost:5001/api/payments/user', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: { payment_type: 'stage' }
        });

        if (paymentsResponse.data.data) {
          const stagePaymentsData = paymentsResponse.data.data.filter(
            (payment: any) => payment.payment_type === 'stage'
          );
          setStagePayments(stagePaymentsData);
        }
      } catch (refreshError) {
        console.error('Error refreshing payments:', refreshError);
        toast.warning('Payment was submitted but could not refresh the payment list.');
      }

      // Reset form
      setAmount('');
      setNotes('');
      setStageDescription('');
      setInvoiceFile(null);
    } catch (submitError) {
      console.error('Error submitting stage payment:', submitError);
      toast.error('Failed to submit payment. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get selected application details
  const getSelectedApplication = () => {
    return approvedApplications.find(app => app.id === selectedApplication);
  };

  return (
    <ApplicationProcessLayout>
      {/* PayNow Payment Modal */}
      {showPaynowModal && paynowResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#224057]">PayNow Inspection Stages Payment</h2>
              <button
                onClick={closePaynowModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {checkingStatus && (
              <div className="mb-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#224057]"></div>
                <span className="ml-2">Checking payment status...</span>
              </div>
            )}

            {paynowResponse.instructions ? (
              <div className="mb-4">
                <h3 className="font-medium text-gray-700 mb-2">Payment Instructions:</h3>
                <div className="bg-gray-100 p-3 rounded-md">
                  <p className="whitespace-pre-line">{paynowResponse.instructions}</p>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p>Please complete your payment on the PayNow website. If you haven't been redirected, click the button below:</p>
                <div className="mt-3">
                  <a
                    href={paynowResponse.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#224057] text-white px-4 py-2 rounded-md hover:bg-[#1a344a]"
                  >
                    Go to PayNow
                  </a>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500 mt-4">
              <p>Your payment is being processed. This window will automatically update when the payment is complete.</p>
              <p className="mt-2">Do not close this window until your payment is confirmed.</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#224057] mb-2">Inspection Stage Payments</h1>
          <p className="text-gray-600 mb-6">
            Make a single payment for all inspection stages of your building project after your plans have been approved.
          </p>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
            </div>
          ) : noApprovedApplications ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No Approved Applications</h2>
              <p className="text-gray-500 mb-6">You don't have any applications with approved documents yet.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/applicant/document-verification"
                  className="px-4 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] transition-colors"
                >
                  Submit Documents for Approval
                </Link>
                <Link
                  href="/applicant/applications"
                  className="px-4 py-2 border border-[#224057] text-[#224057] rounded-md hover:bg-gray-50 transition-colors"
                >
                  View My Applications
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Application Details Card */}
              {getSelectedApplication() && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-lg font-semibold text-[#224057] mb-4">Approved Application Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Stand Number</p>
                      <p className="text-base font-semibold">{getSelectedApplication()?.stand_number}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Owner</p>
                      <p className="text-base font-semibold">{getSelectedApplication()?.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Approval Date</p>
                      <p className="text-base font-semibold">{formatDate(getSelectedApplication()?.document_approval_date || '')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Project Description</p>
                      <p className="text-base">{getSelectedApplication()?.project_description}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Current Stage</p>
                      <p className="text-base font-semibold">{getSelectedApplication()?.current_stage_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {getSelectedApplication()?.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Stage Payment Form */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-[#224057] mb-4">Make Inspection Stages Payment</h2>

                {paymentCompleted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-700 font-medium">Payment completed successfully! You will be redirected to the next stage shortly.</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Application Selection */}
                    <div>
                      <label htmlFor="application" className="block text-sm font-medium text-gray-700 mb-1">
                        Select Application
                      </label>
                      <select
                        id="application"
                        value={selectedApplication}
                        onChange={(e) => setSelectedApplication(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        required
                      >
                        {approvedApplications.map((app) => (
                          <option key={app.id} value={app.id}>
                            Stand {app.stand_number} - {app.project_description || 'Building Plan'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Hidden Stage Description - Set to "All Inspection Stages" by default */}
                    <input
                      type="hidden"
                      id="stageDescription"
                      value="All Inspection Stages"
                      onChange={(e) => setStageDescription(e.target.value)}
                    />

                    {/* Payment Amount - Fixed at $170.00 */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Amount ($)
                      </label>
                      <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 sm:text-sm">
                        $170.00 <span className="text-gray-500 text-xs">(Fixed amount for all inspection stages)</span>
                      </div>
                      <input
                        type="hidden"
                        id="amount"
                        name="amount"
                        value="170.00"
                      />
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        required
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="paynow">PayNow (Online)</option>
                        <option value="paynow_mobile">PayNow (Mobile)</option>
                      </select>
                    </div>

                    {/* Reference Number is now auto-generated */}

                    {/* Invoice Upload */}
                    {paymentMethod === 'cash' && (
                      <div>
                        <label htmlFor="invoice" className="block text-sm font-medium text-gray-700 mb-1">
                          Upload Receipt <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          id="invoice"
                          onChange={handleFileChange}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Upload a scanned copy or photo of your payment receipt (PDF, JPG, PNG)
                        </p>
                      </div>
                    )}

                    {/* PayNow Mobile Payment Options */}
                    {paymentMethod === 'paynow_mobile' && (
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                          placeholder="e.g. 0771234567"
                          required
                        />

                        <label htmlFor="mobileMethod" className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                          Mobile Payment Method <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="mobileMethod"
                          value={mobileMethod}
                          onChange={(e) => setMobileMethod(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                          required
                        >
                          <option value="ecocash">EcoCash</option>
                          <option value="onemoney">OneMoney</option>
                          <option value="innbucks">InnBucks</option>
                          <option value="zimswitch">ZimSwitch</option>
                          <option value="mobile_banking">Internet/Mobile Banking</option>
                        </select>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#224057]"
                        rows={3}
                      ></textarea>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344d] transition-colors flex items-center"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Submit Payment'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Stage Payment History */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-[#224057] mb-4">Inspection Stages Payment History</h2>
                {stagePayments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No stage payments found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Stand Number
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inspection Stages
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Method
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stagePayments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(payment.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {approvedApplications.find(app => app.id === payment.application_id)?.stand_number || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.stage_description || 'All Inspection Stages'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ${(() => {
                                try {
                                  return typeof payment.amount === 'number'
                                    ? payment.amount.toFixed(2)
                                    : parseFloat(String(payment.amount)).toFixed(2);
                                } catch (e) {
                                  return payment.amount || '0.00';
                                }
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                              {payment.payment_method.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {payment.reference_number || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.payment_status)}`}>
                                {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ApplicationProcessLayout>
  );
};

export default StagePaymentsPage;
