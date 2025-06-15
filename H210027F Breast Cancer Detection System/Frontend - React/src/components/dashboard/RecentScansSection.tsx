
import React from 'react';
import PatientHistoryTable from '@/components/scan/PatientHistoryTable';

const RecentScansSection = () => {
  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden w-full">
      <PatientHistoryTable />
    </div>
  );
};

export default RecentScansSection;
