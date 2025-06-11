'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboardlayout';
import { get } from '@/utils/api';
import { FaFile, FaCheckCircle, FaTimesCircle, FaDownload, FaEye } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Document {
  id: string;
  application_id: string;
  file_name: string;
  file_path: string;
  document_type: string;
  status: string;
  compliance_status: string;
  compliance_percentage: number;
  uploaded_at: string;
  updated_at: string;
  stand_number?: string;
  owner_name?: string;
}

const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the admin-specific endpoint to get all documents
        console.log('Fetching documents from admin endpoint...');
        let response;

        try {
          // Use the admin-specific endpoint to get all documents
          response = await get('documents/all');

          console.log('Documents API Response:', response);
          console.log('Response status:', response.status);
          console.log('Response data:', response.data);
        } catch (err) {
          console.error('Error fetching documents from admin endpoint:', err);

          // Try the regular documents endpoint as fallback
          console.log('Error occurred, trying regular documents endpoint as fallback');
          try {
            response = await get('documents');
            console.log('Fallback response:', response);
          } catch (fallbackErr) {
            console.error('Fallback request also failed:', fallbackErr);
            setError('Failed to load documents. Please try again later.');
            setLoading(false);
            return; // Exit early if both requests fail
          }
        }

        // Now we can safely use response since it's defined in the outer scope
        console.log('Response data structure:', {
          hasData: !!response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          hasNestedData: response.data && 'data' in response.data,
          nestedDataType: response.data && 'data' in response.data ? typeof response.data.data : 'N/A',
          isNestedArray: response.data && 'data' in response.data ? Array.isArray(response.data.data) : false
        });

        // Try different response formats
        let documentsData = [];

        if (response.data && Array.isArray(response.data.data)) {
          // Standard API format: { data: [...] }
          console.log('Standard format - Documents data:', response.data.data);
          documentsData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          // Direct array format: [...]
          console.log('Direct array format - Documents data:', response.data);
          documentsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Try to find any array in the response
          console.log('Searching for documents in response object');
          const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            console.log('Found possible document arrays:', possibleArrays);
            documentsData = possibleArrays[0];
          }
        }

        if (documentsData.length > 0) {
          console.log('Found documents data:', documentsData);

          // Get application details to enrich document data
          const applicationsResponse = await get('applications');
          console.log('Applications API Response:', applicationsResponse);

          let applications = [];
          if (applicationsResponse.data && Array.isArray(applicationsResponse.data.data)) {
            applications = applicationsResponse.data.data;
          } else if (applicationsResponse.data && Array.isArray(applicationsResponse.data)) {
            applications = applicationsResponse.data;
          }

          console.log('Applications data:', applications);

          // Map applications to documents
          const enrichedDocuments = documentsData.map((doc: Document) => {
            const relatedApp = applications.find((app: any) => app.id === doc.application_id);
            return {
              ...doc,
              stand_number: relatedApp?.stand_number || 'N/A',
              owner_name: relatedApp?.owner_name || 'N/A'
            };
          });

          console.log('Enriched documents:', enrichedDocuments);
          setDocuments(enrichedDocuments);
        } else {
          console.log('No documents data found');
          setDocuments([]);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDownload = async (doc: Document) => {
    try {
      // Create a download link
      const link = window.document.createElement('a');
      link.href = doc.file_path;
      link.setAttribute('download', doc.file_name);
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      toast.success('Document download started');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handlePreview = (doc: Document) => {
    setSelectedDocument(doc);
    setShowPreviewModal(true);
  };

  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedDocument(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string, complianceStatus: string) => {
    if (status === 'approved' || complianceStatus === 'compliant') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'rejected' || complianceStatus === 'non-compliant') {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string, complianceStatus: string) => {
    if (status === 'approved' || complianceStatus === 'compliant') {
      return 'Approved';
    } else if (status === 'rejected' || complianceStatus === 'non-compliant') {
      return 'Rejected';
    } else {
      return 'Pending';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved')
      return doc.status === 'approved' || doc.compliance_status === 'compliant';
    if (filterStatus === 'rejected')
      return doc.status === 'rejected' || doc.compliance_status === 'non-compliant';
    if (filterStatus === 'pending')
      return (doc.status !== 'approved' && doc.status !== 'rejected') &&
             (doc.compliance_status !== 'compliant' && doc.compliance_status !== 'non-compliant');
    return true;
  });

  return (
    <DashboardLayout userRole="admin">
      <div className="min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#224057]">Documents</h1>
          <p className="text-gray-600 mt-2">View and manage all building plan documents</p>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#224057]">Filter Documents</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'all'
                    ? 'bg-[#224057] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === 'pending'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#224057]">All Documents</h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#224057]"
                />
                <button className="bg-[#224057] text-white px-4 py-2 rounded-lg hover:bg-[#1a344d] transition-colors">
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#224057]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-gray-600 mb-4">No documents found in the system.</p>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm text-left max-w-2xl mx-auto">
                  <p className="font-semibold mb-2">Possible reasons:</p>
                  <ol className="list-decimal list-inside pl-4 space-y-1">
                    <li>No documents have been uploaded yet</li>
                    <li>The documents table in the database is empty</li>
                    <li>You may need to upload a document first</li>
                  </ol>
                  <p className="mt-4 font-semibold">Suggested action:</p>
                  <p>Try uploading a document through the applicant interface, then check this page again.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stand Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Compliance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-[#224057] text-white rounded-full flex items-center justify-center">
                              <FaFile />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {document.file_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {document.document_type || 'Building Plan'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.stand_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.owner_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(document.status, document.compliance_status)}`}>
                            {getStatusText(document.status, document.compliance_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.compliance_percentage ? `${document.compliance_percentage}%` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.uploaded_at ? formatDate(document.uploaded_at) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handlePreview(document)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                            title="Preview"
                          >
                            <FaEye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownload(document)}
                            className="text-green-600 hover:text-green-800"
                            title="Download"
                          >
                            <FaDownload size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-[#224057]">Document Preview</h3>
              <button
                onClick={closePreviewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto">
              <div className="mb-6">
                <h4 className="text-lg font-medium text-[#224057] mb-2">Document Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">File Name:</p>
                    <p className="text-sm font-medium">{selectedDocument.file_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Document Type:</p>
                    <p className="text-sm font-medium">{selectedDocument.document_type || 'Building Plan'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Stand Number:</p>
                    <p className="text-sm font-medium">{selectedDocument.stand_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Owner:</p>
                    <p className="text-sm font-medium">{selectedDocument.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status:</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedDocument.status, selectedDocument.compliance_status)}`}>
                      {getStatusText(selectedDocument.status, selectedDocument.compliance_status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Compliance:</p>
                    <p className="text-sm font-medium">{selectedDocument.compliance_percentage ? `${selectedDocument.compliance_percentage}%` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Uploaded:</p>
                    <p className="text-sm font-medium">{selectedDocument.uploaded_at ? formatDate(selectedDocument.uploaded_at) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated:</p>
                    <p className="text-sm font-medium">{selectedDocument.updated_at ? formatDate(selectedDocument.updated_at) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-lg font-medium text-[#224057] mb-4">Document Preview</h4>
                <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 min-h-[300px] flex items-center justify-center">
                  {selectedDocument.file_path ? (
                    <iframe
                      src={selectedDocument.file_path}
                      className="w-full h-[500px]"
                      title={selectedDocument.file_name}
                    />
                  ) : (
                    <div className="text-gray-500 text-center">
                      <FaFile size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>Preview not available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closePreviewModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg mr-2 hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => selectedDocument && handleDownload(selectedDocument)}
                className="px-4 py-2 bg-[#224057] text-white rounded-lg hover:bg-[#1a344d] transition-colors flex items-center"
              >
                <FaDownload className="mr-2" /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DocumentsPage;
