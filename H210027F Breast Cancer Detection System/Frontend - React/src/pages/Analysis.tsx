import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import InsightsDashboard from '@/components/dashboard/InsightsDashboard';
import ModelPerformanceCharts from '@/components/analytics/ModelPerformanceCharts';
import DiagnosticReport from '@/components/reports/DiagnosticReport';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Activity, BarChart2, ChevronDown } from 'lucide-react';
import { getPatientHistory } from '@/services/api';

const Analysis = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('insights');
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(false);

  // Fetch recent scans for reports
  React.useEffect(() => {
    const fetchRecentScans = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIsLoadingScans(true);
        const history = await getPatientHistory();
        setRecentScans(history.slice(0, 10)); // Get the 10 most recent scans
        
        // Set the first scan as selected by default
        if (history.length > 0 && !selectedScan) {
          setSelectedScan(history[0]);
        }
      } catch (error) {
        console.error('Error fetching recent scans:', error);
      } finally {
        setIsLoadingScans(false);
      }
    };
    
    fetchRecentScans();
  }, [isAuthenticated, selectedScan]);

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
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analysis</h1>
          <p className="text-gray-500 mt-2">
            Comprehensive analysis and diagnostic reports
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="mb-4">
            <TabsTrigger value="insights" className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Patient Insights
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Diagnostic Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights" className="mt-0">
            <InsightsDashboard />
          </TabsContent>
          
          <TabsContent value="model-performance" className="mt-0">
            <ModelPerformanceCharts />
          </TabsContent>
          
          <TabsContent value="reports" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Scans</CardTitle>
                  <CardDescription>
                    Select a scan to view or generate a report
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingScans ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : recentScans.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No scan history available</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {recentScans.map((scan, index) => (
                        <div
                          key={scan.id || index}
                          className={`p-3 rounded-md cursor-pointer transition-colors ${selectedScan && selectedScan.id === scan.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-gray-200'}`}
                          onClick={() => setSelectedScan(scan)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{scan.patient?.name || 'Unknown Patient'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(scan.date || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${scan.result === 'Cancer' || scan.result === 'Malignant' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {scan.result || 'Unknown'}
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            <span className="font-medium">Confidence:</span> {Math.round((scan.confidence || 0) * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <div className="md:col-span-2">
                {selectedScan ? (
                  <DiagnosticReport
                    scanResult={selectedScan}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <CardContent className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700">No Scan Selected</h3>
                      <p className="text-gray-500 mt-2 max-w-md mx-auto">
                        Select a scan from the list to view its diagnostic report or upload a new scan from the dashboard.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analysis;
