
import React from 'react';

interface AnalysisExplanationPanelProps {
  result: {
    result: string;
    confidence: number;
  };
}

const AnalysisExplanationPanel: React.FC<AnalysisExplanationPanelProps> = ({ result }) => {
  return (
    <div className="glass-panel h-full p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">What Does This Mean?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Understanding the classification result
          </p>
        </div>
        
        <div className="space-y-4">
          {result.result === 'Cancer' ? (
            <>
              <div className="border border-red-200 bg-red-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-red-800">Clinical Assessment</h3>
                <p className="text-sm text-red-700 font-medium">
                  Suspicious neoplastic lesion identified—biopsy recommended.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Oncology Protocol:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Immediate histopathological confirmation required</li>
                  <li>Expedited oncology referral initiated</li>
                  <li>Contrast-enhanced MRI indicated</li>
                  <li>Staging workup to commence upon confirmation</li>
                  <li>Treatment planning conference scheduled</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="border border-green-200 bg-green-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-green-800">Clinical Assessment</h3>
                <p className="text-sm text-green-700 font-medium">
                  No malignant pathology detected—routine surveillance advised.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Surveillance Protocol:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Standard screening interval maintained</li>
                  <li>Clinical documentation completed</li>
                  <li>Preventive health measures reinforced</li>
                  <li>6-month surveillance scan recommended</li>
                </ul>
              </div>
            </>
          )}
          
          <div className="border border-gray-200 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-gray-900">Diagnostic Confidence</h3>
            <p className="text-sm text-gray-600">
              Analysis confidence: <span className="font-medium">{Math.round(result.confidence * 100)}%</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className={`h-2.5 rounded-full ${result.confidence > 0.8 ? 'bg-green-600' : result.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.round(result.confidence * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Radiological correlation and clinical context required for definitive diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisExplanationPanel;
