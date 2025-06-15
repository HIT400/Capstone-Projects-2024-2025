
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import PatientHistoryTable from '@/components/scan/PatientHistoryTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const History = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 mt-[50px]">
          <h1 className="text-3xl font-bold text-gray-900">Patient History</h1>
          <p className="text-gray-500 mt-2">
            Comprehensive view of all patient scans and results
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden w-full">
          <PatientHistoryTable />
        </div>
      </div>
    </Layout>
  );
};

export default History;
