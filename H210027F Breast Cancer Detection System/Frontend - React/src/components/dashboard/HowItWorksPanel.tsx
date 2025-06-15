
import React from 'react';

const HowItWorksPanel = () => {
  return (
    <div className="glass-panel h-full p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <p className="text-sm text-gray-500 mt-1">
            Learn about our breast scan classification system
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">1</span>
              </div>
              <h3 className="font-medium text-gray-900">Upload Patient's Scan</h3>
            </div>
            <p className="text-sm text-gray-500 pl-11">
              Upload a high-quality breast scan image along with the patient's basic information.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">2</span>
              </div>
              <h3 className="font-medium text-gray-900">AI Analysis</h3>
            </div>
            <p className="text-sm text-gray-500 pl-11">
              Our advanced AI model processes the image, identifying patterns and features associated with malignant and benign tissues.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">3</span>
              </div>
              <h3 className="font-medium text-gray-900">Review Results</h3>
            </div>
            <p className="text-sm text-gray-500 pl-11">
              Get immediate classification results with confidence scores to help inform your diagnosis.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium">4</span>
              </div>
              <h3 className="font-medium text-gray-900">Access History</h3>
            </div>
            <p className="text-sm text-gray-500 pl-11">
              All scan results are saved securely for future reference. View and filter patient history as needed.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">
            <strong>Important:</strong> This tool is designed to assist medical professionals, not replace clinical judgment. Always consider the full clinical context when making diagnostic decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPanel;
