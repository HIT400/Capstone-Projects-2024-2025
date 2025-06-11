// app/documentVerification/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from '@/utils/toast';
import { get, post } from '@/utils/api';
import ApplicationProcessLayout from '@/components/ApplicationProcessLayout';
import DocumentVerificationError from '@/components/DocumentVerificationError';
import { getNextStageUrl } from '@/utils/applicationFlow';
import { useAuth } from '@/context/AuthContext';
import PaynowTestMode from '@/components/PaynowTestMode';
// We'll use dynamic imports for jsPDF and html2canvas

interface ComplianceIssue {
  standard_reference?: string;
  description?: string;
}

interface ComplianceResult {
  compliant: boolean;
  compliancePercentage: number;
  issues: (string | ComplianceIssue)[];
  warnings?: (string | ComplianceIssue)[];
  suggestions?: (string | ComplianceIssue)[];
  textExtracted: string;
  textQuality?: string;
  error?: string | null;
}

interface Application {
  id: string;
  stand_number: string;
  project_description: string;
  status: string;
  owner_name: string;
  created_at: string;
  current_stage_name?: string;
}

export default function DocumentVerification() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [error, setError] = useState<{message: string, suggestions?: string[]} | null>(null);
  const [showExtractedText, setShowExtractedText] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  // Ref for the compliance results container (for PDF generation)
  const complianceResultsRef = useRef<HTMLDivElement>(null);

  // Payment state
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState<boolean>(false);

  // Payment details
  const [paymentAmount, setPaymentAmount] = useState<string>('200.00');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');

  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [mobileMethod, setMobileMethod] = useState<string>('ecocash');
  const [showPaynowModal, setShowPaynowModal] = useState(false);
  const [paynowResponse, setPaynowResponse] = useState<any>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Add this state to control which form is displayed
  const [activeForm, setActiveForm] = useState<'document' | 'payment'>('payment');

  // Fetch user's applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);
        const response = await get('application-stages/user/applications');

        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          setApplications(response.data.data);

          // Select the first application by default if available
          if (response.data.data.length > 0) {
            setSelectedApplication(response.data.data[0].id);
          } else {
            toast.warning('No applications found. Please create an application first.');
          }
        } else {
          setApplications([]);
          toast.warning('No applications found. Please create an application first.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications. Please try again later.');
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchApplications();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setComplianceResult(null); // Clear previous results
    }
  };

  const handleApplicationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedApplication(e.target.value);
    setComplianceResult(null); // Clear previous results
  };

  // Payment handlers
  const handlePaymentAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Do nothing - amount is fixed at 200.00
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPaymentMethod(e.target.value);
  };




  const handlePaymentNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPaymentNotes(e.target.value);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  const handleMobileMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMobileMethod(e.target.value);
  };

  // Close PayNow modal
  const closePaynowModal = () => {
    setShowPaynowModal(false);
    setPaynowResponse(null);
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
        const response = await get(`payments/paynow/status/${paymentId}`);

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

          // Show a message about proceeding to document upload
          setTimeout(() => {
            toast.info('You can now proceed to document upload');
          }, 1000);
          return;
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
      } catch (error) {
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

  // Generate document name based on selected application
  const getDocumentName = (): string => {
    if (!selectedApplication) return '';

    const selectedApp = applications.find(app => app.id === selectedApplication);
    if (!selectedApp) return '';

    const currentYear = new Date().getFullYear();
    return `${selectedApp.stand_number} Building Plan ${currentYear}`;
  };

  // Handle payment submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApplication) {
      toast.error('Please select an application');
      return;
    }

    // Payment amount is fixed at 200.00
    // No need to validate

    // Cash payments are no longer accepted

    // No longer needed as all payments are online

    // For mobile payments, require a phone number
    if (paymentMethod === 'paynow_mobile' && !phone) {
      toast.error('Please enter your mobile number for mobile payments');
      return;
    }

    // Check if user email is available
    if (!user?.email) {
      toast.error('User email is required for payment processing');
      return;
    }

    setPaymentSubmitting(true);

    // Process online payment

    try {
      const paymentData: any = {
        applicationId: selectedApplication,
        email: user?.email, // Get email from AuthContext
        description: `Plan Approval Payment for Application #${selectedApplication}`,
        paymentType: 'plan',
        isMobile: paymentMethod === 'paynow_mobile'
      };

      // Add mobile payment specific fields
      if (paymentMethod === 'paynow_mobile') {
        paymentData.phone = phone;
        paymentData.method = mobileMethod;
      }

      // Log payment data for debugging
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Initiating payment with data:', paymentData);
      }

      try {
        // Make the actual API call to initiate payment
        const response = await post('payments/paynow/initiate', paymentData);

        // Only log in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('Payment response:', response);
        }

        if (response.data.status === 201 && response.data.data) {
          setPaynowResponse(response.data.data.paynow);
          setShowPaynowModal(true);

          // For web payments, open the payment URL in a new tab
          if (paymentMethod === 'paynow' && response.data.data.paynow.redirectUrl) {
            window.open(response.data.data.paynow.redirectUrl, '_blank');
          }

          // Start polling for payment status
          if (response.data.data.payment && response.data.data.payment.id) {
            pollPaymentStatus(response.data.data.payment.id);
          }

          setPaymentSubmitting(false);
          return;
        } else {
          console.error('Payment failed:', response.data);
          toast.error(response.data.message || 'Failed to initiate payment');
          setPaymentSubmitting(false);
          return;
        }
      } catch (err) {
        // Only log detailed errors in development environment
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in payment:', err);
        } else {
          console.error('Error in payment');
        }

        // Get more specific error message if available
        let errorMessage = 'Failed to initiate payment. Please try again.';

        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (err.response.status === 404) {
            errorMessage = 'Payment service not found. Please try again later.';
          } else if (err.response.status === 400) {
            if (err.response.data && err.response.data.message) {
              errorMessage = `Payment error: ${err.response.data.message}`;
            } else {
              errorMessage = 'Invalid payment request. Please check your payment details.';
            }
          } else if (err.response.status === 401) {
            errorMessage = 'Authentication error. Please log in again.';
          } else if (err.response.status === 500) {
            errorMessage = 'Payment server error. Please try again later.';
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage = 'No response from payment server. Please check your internet connection.';
        }

        toast.error(errorMessage);
        setPaymentSubmitting(false);
        return;
      }
    } catch (err) {
      // Only log detailed errors in development environment
      if (process.env.NODE_ENV === 'development') {
        console.error('Error preparing payment:', err);
      } else {
        console.error('Error preparing payment');
      }

      toast.error('Failed to prepare payment. Please check your payment details and try again.');
      setPaymentSubmitting(false);
      return;
    }


  };

  // Handle document verification
  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if payment has been completed
    if (!paymentCompleted) {
      toast.error('You must complete payment before uploading documents');
      toggleForm('payment');
      return;
    }

    // Validate required fields
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!selectedApplication) {
      toast.error('Please select an application');
      return;
    }

    // Document name is generated automatically, so we just need to check if an application is selected
    const documentName = getDocumentName();
    if (!documentName) {
      toast.error('Please select a valid application');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setError(null);
    setComplianceResult(null);
    setUploadedDocumentId(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicationId', selectedApplication);
    formData.append('documentName', documentName);

    try {
      // Upload document
      setProgress(30);

      // We need to use fetch directly for FormData uploads
      const uploadResponse = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        // No need to set Authorization header as it's handled by the API proxy
      });

      if (!uploadResponse.ok) {
        console.error('Upload response not OK:', uploadResponse.status, uploadResponse.statusText);
        let errorData;
        try {
          errorData = await uploadResponse.json();
          console.error('Error data:', errorData);
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorData = {};
        }
        throw new Error(errorData.error || errorData.message || `Upload failed with status ${uploadResponse.status}`);
      }

      setProgress(60);
      const responseData = await uploadResponse.json();

      // Validate response data structure
      console.log('Response data:', responseData);

      // Check if the document ID is directly in the data object
      let documentId;
      if (responseData.data && responseData.data.id) {
        documentId = responseData.data.id;
      } else if (responseData.data && responseData.data.document && responseData.data.document.id) {
        // If the document is nested in a document property (when payment is included)
        documentId = responseData.data.document.id;
      } else if (responseData.data && typeof responseData.data === 'object') {
        // Try to find the ID directly in the data object
        documentId = responseData.data.id;
      }

      if (!documentId) {
        console.error('Invalid response data structure:', responseData);
        throw new Error('Invalid response from server. Document ID is missing.');
      }

      console.log('Document uploaded successfully with ID:', documentId);
      setUploadedDocumentId(documentId);

      // Get compliance results
      if (!documentId) {
        throw new Error('Document ID is missing. Cannot check compliance.');
      }

      console.log('Checking compliance for document ID:', documentId);
      const complianceResponse = await fetch(`/api/documents/${documentId}/compliance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const complianceData = await complianceResponse.json();

      if (!complianceResponse.ok) {
        // Handle 422 status code differently - this is a validation issue, not a server error
        if (complianceResponse.status === 422) {
          // Still show the compliance data even with warnings
          const processedData = {
            ...complianceData.data,
            warnings: complianceData.data.warnings || [],
            suggestions: complianceData.data.suggestions || []
          };
          setComplianceResult(processedData);
          toast.warning(complianceData.message || 'Compliance check completed with warnings');
        } else {
          setError({
            message: complianceData.message || complianceData.error || 'Failed to check compliance',
            suggestions: complianceData.suggestions || []
          });
          return;
        }
      } else {
        // Process the compliance data to ensure warnings and suggestions exist
        const processedData = {
          ...complianceData.data,
          warnings: complianceData.data.warnings || [],
          suggestions: complianceData.data.suggestions || []
        };
        setComplianceResult(processedData);
      }

      // Process successful compliance check
      setProgress(90);

      // Ensure warnings and suggestions arrays exist
      const processedComplianceData = {
        ...complianceData.data,
        warnings: complianceData.data.warnings || [],
        suggestions: complianceData.data.suggestions || []
      };

      // Log the processed compliance data
      console.log('Processed compliance data:', processedComplianceData);
      console.log('Has warnings:', processedComplianceData.warnings.length > 0);
      console.log('Has suggestions:', processedComplianceData.suggestions.length > 0);

      setComplianceResult(processedComplianceData);

      if (processedComplianceData.compliant) {
        // If the document is compliant and application was updated
        if (complianceData.application_updated) {
          toast.success('Document complies with building standards!');
          toast.success('Your application has been approved!');
        } else {
          toast.success('Document complies with building standards!');
          toast.success('Your application has been approved!');
        }

        // Wait a moment before redirecting to the next stage
        setTimeout(() => {
          const nextStageUrl = getNextStageUrl('document-verification');
          if (nextStageUrl) {
            toast.success('Proceeding to next stage...');
            router.push(nextStageUrl);
          }
        }, 2000);
      } else if (complianceData.data.issues && complianceData.data.issues.length > 0) {
        toast.error(`Found ${complianceData.data.issues.length} compliance issues`);
        toast.warning('Your application will remain in pending status until a compliant document is submitted.');
      } else {
        toast.success('Document verification completed');
        toast.warning('Your application will remain in pending status until a compliant document is submitted.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError({
        message: err instanceof Error ? err.message : 'Document verification failed',
        suggestions: [
          'Check your internet connection',
          'Ensure the document is in a supported format (PDF, JPEG, PNG)',
          'Try a different document if the problem persists'
        ]
      });
      toast.error('Document verification failed');
    } finally {
      setProgress(100);
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const toggleForm = (formType: 'document' | 'payment') => {
    setActiveForm(formType);
  };

  // Function to generate and download PDF
  const generatePDF = async () => {
    if (!complianceResult || !complianceResultsRef.current) {
      toast.error('No compliance results to export');
      return;
    }

    try {
      setGeneratingPdf(true);
      toast.info('Generating PDF, please wait...');

      try {
        // Dynamically import jsPDF and html2canvas
        const [jsPDFModule, html2canvasModule] = await Promise.all([
          import('jspdf'),
          import('html2canvas')
        ]);

        const jsPDF = jsPDFModule.default;
        const html2canvas = html2canvasModule.default;

        // Get the selected application details
        const selectedApp = applications.find(app => app.id === selectedApplication);
        const documentName = selectedApp ? getDocumentName() : 'Compliance-Results';

        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add title
        pdf.setFontSize(18);
        pdf.setTextColor(34, 64, 87); // #224057
        pdf.text('Building Plan Compliance Report', pageWidth / 2, 20, { align: 'center' });

        // Add document info
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        if (selectedApp) {
          pdf.text(`Stand Number: ${selectedApp.stand_number}`, 20, 30);
          pdf.text(`Owner: ${selectedApp.owner_name}`, 20, 37);
          pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 44);
        }

        // Add compliance status
        pdf.setFontSize(14);
        // Set text color based on compliance status (green for compliant, red for non-compliant)
        if (complianceResult.compliant) {
          pdf.setTextColor(0, 128, 0); // Green
        } else {
          pdf.setTextColor(255, 0, 0); // Red
        }
        pdf.text(`Compliance Status: ${complianceResult.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}`, 20, 55);
        pdf.setTextColor(0, 0, 0); // Reset to black
        pdf.text(`Compliance Score: ${complianceResult.compliancePercentage}%`, 20, 62);

        // Capture the issues, warnings, and suggestions sections
        let yPosition = 70;

        // Add issues
        if (complianceResult.issues && complianceResult.issues.length > 0) {
          pdf.setFontSize(14);
          pdf.setTextColor(200, 0, 0); // Red for issues
          pdf.text(`Issues (${complianceResult.issues.length})`, 20, yPosition);
          yPosition += 7;

          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0); // Reset to black

          complianceResult.issues.forEach((issue, index) => {
            const issueText = typeof issue === 'string'
              ? issue
              : `${issue.standard_reference ? issue.standard_reference + ': ' : ''}${issue.description || ''}`;

            // Split long text into multiple lines
            const splitText = pdf.splitTextToSize(issueText, pageWidth - 40);

            // Check if we need a new page
            if (yPosition + splitText.length * 5 > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.text(splitText, 20, yPosition);
            yPosition += splitText.length * 5 + 5;
          });
        }

        // Add warnings
        if (complianceResult.warnings && complianceResult.warnings.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(200, 150, 0); // Yellow/orange for warnings
          pdf.text(`Warnings (${complianceResult.warnings.length})`, 20, yPosition);
          yPosition += 7;

          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0); // Reset to black

          complianceResult.warnings.forEach((warning, index) => {
            const warningText = typeof warning === 'string'
              ? warning
              : `${warning.standard_reference ? warning.standard_reference + ': ' : ''}${warning.description || ''}`;

            // Split long text into multiple lines
            const splitText = pdf.splitTextToSize(warningText, pageWidth - 40);

            // Check if we need a new page
            if (yPosition + splitText.length * 5 > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.text(splitText, 20, yPosition);
            yPosition += splitText.length * 5 + 5;
          });
        }

        // Add suggestions
        if (complianceResult.suggestions && complianceResult.suggestions.length > 0) {
          // Check if we need a new page
          if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(0, 100, 200); // Blue for suggestions
          pdf.text(`Suggestions (${complianceResult.suggestions.length})`, 20, yPosition);
          yPosition += 7;

          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0); // Reset to black

          complianceResult.suggestions.forEach((suggestion, index) => {
            const suggestionText = typeof suggestion === 'string'
              ? suggestion
              : `${suggestion.standard_reference ? suggestion.standard_reference + ': ' : ''}${suggestion.description || ''}`;

            // Split long text into multiple lines
            const splitText = pdf.splitTextToSize(suggestionText, pageWidth - 40);

            // Check if we need a new page
            if (yPosition + splitText.length * 5 > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            pdf.text(splitText, 20, yPosition);
            yPosition += splitText.length * 5 + 5;
          });
        }

        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100); // Gray for footer
        pdf.text('Generated by ZimBuilds Building Plan Approval System', pageWidth / 2, pageHeight - 10, { align: 'center' });

        // Save the PDF
        pdf.save(`${documentName}-Compliance-Report.pdf`);

        toast.success('PDF report downloaded successfully');
        return;
      } catch (importError) {
        console.error('Error importing PDF libraries:', importError);
        toast.warning('PDF generation libraries not available. Falling back to text report.');

        // Fallback to text report if PDF libraries fail to load
        const selectedApp = applications.find(app => app.id === selectedApplication);
        const documentName = selectedApp ? getDocumentName() : 'Compliance-Results';

        // Create a text version of the report
        let reportText = "BUILDING PLAN COMPLIANCE REPORT\n\n";

        if (selectedApp) {
          reportText += `Stand Number: ${selectedApp.stand_number}\n`;
          reportText += `Owner: ${selectedApp.owner_name}\n`;
          reportText += `Date: ${new Date().toLocaleDateString()}\n\n`;
        }

        reportText += `Compliance Status: ${complianceResult.compliant ? 'COMPLIANT' : 'NON-COMPLIANT'}\n`;
        reportText += `Compliance Score: ${complianceResult.compliancePercentage}%\n\n`;

        if (complianceResult.issues && complianceResult.issues.length > 0) {
          reportText += `ISSUES (${complianceResult.issues.length}):\n`;
          complianceResult.issues.forEach((issue, index) => {
            const issueText = typeof issue === 'string'
              ? issue
              : `${issue.standard_reference ? issue.standard_reference + ': ' : ''}${issue.description || ''}`;
            reportText += `${index + 1}. ${issueText}\n`;
          });
          reportText += '\n';
        }

        if (complianceResult.warnings && complianceResult.warnings.length > 0) {
          reportText += `WARNINGS (${complianceResult.warnings.length}):\n`;
          complianceResult.warnings.forEach((warning, index) => {
            const warningText = typeof warning === 'string'
              ? warning
              : `${warning.standard_reference ? warning.standard_reference + ': ' : ''}${warning.description || ''}`;
            reportText += `${index + 1}. ${warningText}\n`;
          });
          reportText += '\n';
        }

        if (complianceResult.suggestions && complianceResult.suggestions.length > 0) {
          reportText += `SUGGESTIONS (${complianceResult.suggestions.length}):\n`;
          complianceResult.suggestions.forEach((suggestion, index) => {
            const suggestionText = typeof suggestion === 'string'
              ? suggestion
              : `${suggestion.standard_reference ? suggestion.standard_reference + ': ' : ''}${suggestion.description || ''}`;
            reportText += `${index + 1}. ${suggestionText}\n`;
          });
        }

        // Create a blob and download it
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentName}-Compliance-Report.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Text report downloaded successfully');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <ApplicationProcessLayout>
    {/* Payment Modal */}
    {showPaynowModal && paynowResponse && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#224057]">Payment Processing</h2>
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
              <p>Please complete your payment on the payment gateway. If you haven't been redirected, click the button below:</p>
              <div className="mt-3">
                <a
                  href={paynowResponse.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-[#224057] text-white px-4 py-2 rounded-md hover:bg-[#1a344a]"
                >
                  Go to Payment Gateway
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

    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#224057]">Payment & Document Verification</h1>
        <p className="text-gray-600 mt-2">
          First make the required payment, then upload your building plans for verification.
        </p>
      </div>

      {/* Form Selection Buttons */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => toggleForm('payment')}
            className={`px-6 py-3 rounded-md font-medium ${
              activeForm === 'payment'
                ? 'bg-[#224057] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            1. Plan Approval Payment
          </button>
          <button
            onClick={() => toggleForm('document')}
            className={`px-6 py-3 rounded-md font-medium ${
              activeForm === 'document'
                ? 'bg-[#224057] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            } ${!paymentCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!paymentCompleted}
          >
            2. Document Verification
          </button>
        </div>

        {/* Document Verification Form */}
        {activeForm === 'document' && (
          <div>
            <h2 className="text-xl font-semibold text-[#224057] mb-4">Upload Building Plans</h2>

            {!paymentCompleted ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You must complete payment before uploading documents.
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => toggleForm('payment')}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        Go to Payment Form
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDocumentSubmit} className="space-y-4">
                {/* Application Selection */}
                <div>
                  <label htmlFor="application-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Application
                  </label>
                  <select
                    id="application-select"
                    value={selectedApplication || ''}
                    onChange={handleApplicationChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    disabled={loadingApplications || applications.length === 0}
                    required
                  >
                    {loadingApplications ? (
                      <option value="">Loading applications...</option>
                    ) : applications.length === 0 ? (
                      <option value="">No applications found</option>
                    ) : (
                      <>
                        <option value="">Select an application</option>
                        {applications.map(app => (
                          <option key={app.id} value={app.id}>
                            {app.stand_number} - {app.project_description}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  {applications.length === 0 && !loadingApplications && (
                    <p className="mt-2 text-xs text-red-500">
                      Please create an application first before uploading documents.
                    </p>
                  )}
                </div>

                {/* Document Name Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Name
                  </label>
                  <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 sm:text-sm">
                    {selectedApplication ? getDocumentName() : 'Select an application to generate document name'}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Document name is automatically generated based on the stand number and current year
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Document
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      id="document-upload"
                      name="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      disabled={!selectedApplication}
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    PDF, JPG, or PNG (Max. 10MB)
                  </p>
                </div>

                {isLoading && (
                  <div className="pt-1">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Processing...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={!file || !selectedApplication || isLoading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#224057] hover:bg-[#1a344a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057] ${
                      (!file || !selectedApplication || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Compliance'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Payment Form */}
        {activeForm === 'payment' && (
          <div>
            <h2 className="text-xl font-semibold text-[#224057] mb-4">Plan Approval Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              {/* Application Selection */}
              <div>
                <label htmlFor="application-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Application
                </label>
                <select
                  id="application-select"
                  value={selectedApplication || ''}
                  onChange={handleApplicationChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  disabled={loadingApplications || applications.length === 0}
                  required
                >
                  {loadingApplications ? (
                    <option value="">Loading applications...</option>
                  ) : applications.length === 0 ? (
                    <option value="">No applications found</option>
                  ) : (
                    <>
                      <option value="">Select an application</option>
                      {applications.map(app => (
                        <option key={app.id} value={app.id}>
                          {app.stand_number} - {app.project_description}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {applications.length === 0 && !loadingApplications && (
                  <p className="mt-2 text-xs text-red-500">
                    Please create an application first before making a payment.
                  </p>
                )}
              </div>

              {/* Payment Details Section */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide payment information for your application. You must submit payment before uploading documents.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Payment Amount - Fixed at $200.00 */}
                  <div>
                    <label htmlFor="payment-amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Amount (USD)
                    </label>
                    <div className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 sm:text-sm">
                      $200.00 <span className="text-gray-500 text-xs">(Fixed amount for plan approval)</span>
                    </div>
                    <input
                      type="hidden"
                      id="payment-amount"
                      name="paymentAmount"
                      value="200.00"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label htmlFor="payment-method" className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="payment-method"
                      name="paymentMethod"
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    >
                      <option value="paynow">PayNow (Online)</option>
                      <option value="paynow_mobile">PayNow (Mobile)</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>



                  {/* PayNow Mobile Payment Options */}
                  {paymentMethod === 'paynow_mobile' && (
                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={handlePhoneChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="e.g. 0771234567"
                          required={paymentMethod === 'paynow_mobile'}
                        />
                      </div>
                      <div>
                        <label htmlFor="mobileMethod" className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Provider <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="mobileMethod"
                          value={mobileMethod}
                          onChange={handleMobileMethodChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required={paymentMethod === 'paynow_mobile'}
                        >
                          <option value="ecocash">EcoCash</option>
                          <option value="onemoney">OneMoney</option>
                          <option value="innbucks">InnBucks</option>
                          <option value="zimswitch">ZimSwitch</option>
                          <option value="mobile_banking">Internet/Mobile Banking</option>
                        </select>
                      </div>
                    </div>
                  )}


                </div>

                {/* Payment Notes */}
                <div className="mt-4">
                  <label htmlFor="payment-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="payment-notes"
                    name="paymentNotes"
                    rows={3}
                    value={paymentNotes}
                    onChange={handlePaymentNotesChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any additional information about your payment"
                  ></textarea>
                </div>
              </div>

              {paymentSubmitting && (
                <div className="pt-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Processing payment...</span>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300 animate-pulse w-full"
                    ></div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={!selectedApplication || paymentSubmitting || !paymentAmount}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#224057] hover:bg-[#1a344a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#224057] ${
                    (!selectedApplication || paymentSubmitting || !paymentAmount) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {paymentSubmitting ? 'Processing Payment...' : 'Submit Payment'}
                </button>
              </div>

              {paymentCompleted && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-green-700 font-medium">Payment completed successfully! You can now proceed to document upload.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleForm('document')}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Proceed to Document Upload
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Compliance Results Section */}
      {complianceResult && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6" ref={complianceResultsRef}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#224057]">Compliance Results</h2>
            <button
              onClick={generatePDF}
              disabled={generatingPdf}
              className={`flex items-center px-4 py-2 bg-[#224057] text-white rounded-md hover:bg-[#1a344a] transition-colors ${
                generatingPdf ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {generatingPdf ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Report
                </>
              )}
            </button>
          </div>

          {/* Compliance Status and Percentage */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">
                Compliance Status:
                <span className={`ml-2 ${complianceResult.compliant ? 'text-green-600' : 'text-red-600'}`}>
                  {complianceResult.compliant ? 'Compliant' : 'Non-Compliant'}
                </span>
              </h3>
              <div className="text-right">
                <span className="text-sm text-gray-500">Compliance Score</span>
                <div className="text-2xl font-bold">
                  {complianceResult.compliancePercentage}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full ${
                  complianceResult.compliancePercentage >= 80 ? 'bg-green-500' :
                  complianceResult.compliancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${complianceResult.compliancePercentage}%` }}
              ></div>
            </div>

            {/* Text Quality */}
            {complianceResult.textQuality && (
              <div className="text-sm text-gray-600 mt-2">
                <span className="font-medium">Document Quality:</span> {complianceResult.textQuality}
              </div>
            )}
          </div>

          {/* Issues, Warnings, and Suggestions */}
          <div className="space-y-6">
            {/* Issues */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-medium text-red-700 mb-3">
                Issues {complianceResult.issues && complianceResult.issues.length > 0 ?
                  `(${complianceResult.issues.length})` : '(0)'}
              </h3>
              {complianceResult.issues && complianceResult.issues.length > 0 ? (
                <ul className="space-y-2">
                  {complianceResult.issues.map((issue, index) => (
                    <li key={`issue-${index}`} className="text-sm">
                      {typeof issue === 'string' ? (
                        <div className="text-red-700">{issue}</div>
                      ) : (
                        <div>
                          {issue.standard_reference && (
                            <div className="font-medium text-red-800">{issue.standard_reference}</div>
                          )}
                          <div className="text-red-700">{issue.description}</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No issues found. Your document meets all critical requirements.</p>
              )}
            </div>

            {/* Warnings */}
            <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <h3 className="text-lg font-medium text-yellow-700 mb-3">
                Warnings {complianceResult.warnings && complianceResult.warnings.length > 0 ?
                  `(${complianceResult.warnings.length})` : '(0)'}
              </h3>
              {complianceResult.warnings && complianceResult.warnings.length > 0 ? (
                <ul className="space-y-2">
                  {complianceResult.warnings.map((warning, index) => (
                    <li key={`warning-${index}`} className="text-sm">
                      {typeof warning === 'string' ? (
                        <div className="text-yellow-700">{warning}</div>
                      ) : (
                        <div>
                          {warning.standard_reference && (
                            <div className="font-medium text-yellow-800">{warning.standard_reference}</div>
                          )}
                          <div className="text-yellow-700">{warning.description}</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No warnings found. Your document meets all recommended guidelines.</p>
              )}
            </div>

            {/* Suggestions */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-medium text-blue-700 mb-3">
                Suggestions {complianceResult.suggestions && complianceResult.suggestions.length > 0 ?
                  `(${complianceResult.suggestions.length})` : '(0)'}
              </h3>
              {complianceResult.suggestions && complianceResult.suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {complianceResult.suggestions.map((suggestion, index) => (
                    <li key={`suggestion-${index}`} className="text-sm">
                      {typeof suggestion === 'string' ? (
                        <div className="text-blue-700">{suggestion}</div>
                      ) : (
                        <div>
                          {suggestion.standard_reference && (
                            <div className="font-medium text-blue-800">{suggestion.standard_reference}</div>
                          )}
                          <div className="text-blue-700">{suggestion.description}</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No suggestions available. Your document is well-structured.</p>
              )}
            </div>
          </div>

          {/* Extracted Text */}
          {complianceResult.textExtracted && (
            <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer"
                onClick={() => setShowExtractedText(!showExtractedText)}
              >
                <h3 className="text-lg font-medium text-gray-700">
                  Extracted Text
                  <span className="ml-2 text-sm text-gray-500">
                    ({complianceResult.textExtracted.length} characters)
                  </span>
                </h3>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(complianceResult.textExtracted);
                      toast.success('Extracted text copied to clipboard');
                    }}
                    className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 mr-2"
                  >
                    Copy Text
                  </button>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 ${showExtractedText ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {showExtractedText && (
                <div className="bg-white p-4 overflow-auto max-h-60 border-t border-gray-200">
                  <pre className="text-xs whitespace-pre-wrap text-gray-800">
                    {complianceResult.textExtracted}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <DocumentVerificationError
          message={error.message}
          suggestions={error.suggestions}
        />
      )}
    </div>
    </ApplicationProcessLayout>
  );
}
