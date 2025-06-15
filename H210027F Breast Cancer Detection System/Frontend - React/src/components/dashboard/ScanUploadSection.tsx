
import React from 'react';
import ScanUpload from '@/components/scan/ScanUpload';
import HowItWorksPanel from './HowItWorksPanel';

interface ScanUploadSectionProps {
  onUploadSuccess: (result: any) => void;
}

const ScanUploadSection: React.FC<ScanUploadSectionProps> = ({ onUploadSuccess }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <ScanUpload onUploadSuccess={onUploadSuccess} />
      </div>
      <div className="lg:pl-4">
        <HowItWorksPanel />
      </div>
    </div>
  );
};

export default ScanUploadSection;
