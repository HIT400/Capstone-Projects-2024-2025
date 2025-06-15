
import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ScanUploadSection from '@/components/dashboard/ScanUploadSection';
import ScanResultSection from '@/components/dashboard/ScanResultSection';
import PatientHistoryTable from '@/components/dashboard/PatientHistoryTable';
import { BarChart3, Upload, History, FileText } from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('upload');
  const [scanResult, setScanResult] = useState<any>(null);
  const [selectedScan, setSelectedScan] = useState<any>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleUploadSuccess = (result: any) => {
    setScanResult(result);
    setActiveTab('result');
  };

  return (
    <Layout className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 mt-[50px]">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Upload and analyze breast scans
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="upload" className="flex items-center">
              <Upload className="h-4 w-4 mr-1" />
              Upload Scan
            </TabsTrigger>
            {scanResult && (
              <TabsTrigger value="result" className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                Analysis Result
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <ScanUploadSection onUploadSuccess={handleUploadSuccess} />
          </TabsContent>
          
          {scanResult && (
            <TabsContent value="result" className="mt-0">
              <ScanResultSection result={scanResult} />
            </TabsContent>
          )}
          
          <TabsContent value="history" className="mt-0">
            <PatientHistoryTable onSelectScan={(scan) => {
              setScanResult(scan);
              setActiveTab('result');
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dashboard;
