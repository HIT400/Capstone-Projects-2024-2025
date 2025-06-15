
import React, { useState } from 'react';
import ScanResult from '@/components/scan/ScanResult';
import AnalysisExplanationPanel from './AnalysisExplanationPanel';
import ScanImageModal from '@/components/scan/ScanImageModal';
import AppointmentConfirmation from './AppointmentConfirmation';
import InsightsDashboard from './InsightsDashboard';
import { getImageUrl } from '@/services/api';

interface ScanResultSectionProps {
  result: any;
}

const ScanResultSection: React.FC<ScanResultSectionProps> = ({ result }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  
  // Get the properly formatted image URL
  const imagePath = result.image_path || '/placeholder.svg';

  const handleViewDetailedAnalysis = () => {
    setShowImageModal(true);
  };
  
  const handleToggleInsights = () => {
    setShowInsights(prev => !prev);
  };
  
  // For debugging
  React.useEffect(() => {
    console.log('Result image path:', result.image_path);
    console.log('Using image path:', imagePath);
    console.log('Local image ID:', result.localImageId);
    
    // Convert the "Malignant" or "Benign" to "Cancer" or "Non-Cancer"
    if (result.result === 'Malignant') {
      result.result = 'Cancer';
    } else if (result.result === 'Benign') {
      result.result = 'Non-Cancer';
    }
  }, [result.image_path, imagePath, result.localImageId, result.result]);

  const isCancer = result.result === 'Cancer';

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ScanResult 
              result={result} 
              onViewDetailedAnalysis={handleViewDetailedAnalysis}
              onToggleInsights={handleToggleInsights} 
            />
          </div>
          <div className="lg:pl-4">
            <AnalysisExplanationPanel result={result} />
          </div>
        </div>

        <AppointmentConfirmation 
          isCancer={isCancer}
          patientName={result.patient.name}
          patientAge={result.patient.age}
          patientGender={result.patient.gender}
        />

        {showInsights && <InsightsDashboard />}
      </div>

      <ScanImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imagePath={imagePath}
        patientName={result.patient.name}
        result={result}
      />
    </>
  );
};

export default ScanResultSection;
