import React, { useState } from 'react';
import { AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

interface DocumentVerificationErrorProps {
  error: string;
  documentId: string;
  suggestions?: string[];
  onRetry?: () => void;
}

const DocumentVerificationError: React.FC<DocumentVerificationErrorProps> = ({
  error,
  documentId,
  suggestions = [],
  onRetry
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleRetry = async () => {
    if (!documentId) return;
    
    setIsRetrying(true);
    setRetryResult(null);
    
    try {
      const response = await fetch(`http://localhost:5001/api/documents/${documentId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setRetryResult({
          success: true,
          message: result.message || 'Document processing retry successful'
        });
        
        // Call the parent component's onRetry callback if provided
        if (onRetry) {
          onRetry();
        }
      } else {
        setRetryResult({
          success: false,
          message: result.message || result.error || 'Failed to retry document processing'
        });
      }
    } catch (error) {
      setRetryResult({
        success: false,
        message: 'An error occurred while retrying document processing'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Document Verification Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          
          {suggestions.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium text-red-800">Suggestions:</h4>
              <ul className="mt-1 list-disc list-inside text-sm text-red-700">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-4">
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="animate-spin -ml-0.5 mr-2 h-4 w-4" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="-ml-0.5 mr-2 h-4 w-4" />
                  Retry Processing
                </>
              )}
            </button>
          </div>
          
          {retryResult && (
            <div className={`mt-3 p-2 rounded ${retryResult.success ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {retryResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm ${retryResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {retryResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentVerificationError;
