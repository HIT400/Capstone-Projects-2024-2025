import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mlService, ModelMetrics } from '@/services/mlService';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
  PieChart,
  Pie,
  Sector
} from 'recharts';
import { AlertCircle, HelpCircle } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ModelPerformanceCharts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for metrics and chart data
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [rocCurveData, setRocCurveData] = useState<any>(null);
  const [performanceHistory, setPerformanceHistory] = useState<any>(null);
  
  // Fetch model metrics and performance data
  useEffect(() => {
    const fetchModelData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch model metrics
        const metricsData = await mlService.getModelMetrics();
        setMetrics(metricsData);
        
        // Fetch ROC curve data
        const rocData = await mlService.getROCCurveData();
        
        // Transform ROC data for chart
        const rocChartData = rocData.fpr.map((fpr, index) => ({
          fpr,
          tpr: rocData.tpr[index],
          threshold: rocData.thresholds[index]
        }));
        setRocCurveData({
          data: rocChartData,
          auc: rocData.auc
        });
        
        // Fetch performance history
        const historyData = await mlService.getModelPerformanceHistory();
        
        // Transform history data for chart
        const historyChartData = historyData.dates.map((date, index) => ({
          date,
          accuracy: historyData.accuracy[index],
          precision: historyData.precision[index],
          recall: historyData.recall[index]
        }));
        setPerformanceHistory(historyChartData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching model data:', err);
        setError('Failed to load model performance data');
        
        // Set mock data for development/preview
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModelData();
  }, []);
  
  // Set mock data for development/preview
  const setMockData = () => {
    // Mock metrics
    setMetrics({
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.94,
      f1Score: 0.91,
      auc: 0.95,
      confusionMatrix: [
        [120, 15],
        [8, 157]
      ]
    });
    
    // Mock ROC curve data
    const mockRocData = [];
    for (let i = 0; i <= 10; i++) {
      mockRocData.push({
        fpr: i * 0.1,
        tpr: Math.min(1, i * 0.1 * 1.2 + 0.1),
        threshold: 1 - i * 0.1
      });
    }
    setRocCurveData({
      data: mockRocData,
      auc: 0.95
    });
    
    // Mock performance history
    const mockHistoryData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      mockHistoryData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        accuracy: 0.85 + Math.random() * 0.1,
        precision: 0.82 + Math.random() * 0.1,
        recall: 0.88 + Math.random() * 0.1
      });
    }
    setPerformanceHistory(mockHistoryData);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };
  
  // Generate confusion matrix data for visualization
  const getConfusionMatrixData = () => {
    if (!metrics) return [];
    
    const matrix = metrics.confusionMatrix;
    const total = matrix[0][0] + matrix[0][1] + matrix[1][0] + matrix[1][1];
    
    return [
      {
        name: 'True Negative',
        value: matrix[0][0],
        percentage: (matrix[0][0] / total) * 100,
        fill: '#4ade80'
      },
      {
        name: 'False Positive',
        value: matrix[0][1],
        percentage: (matrix[0][1] / total) * 100,
        fill: '#fb7185'
      },
      {
        name: 'False Negative',
        value: matrix[1][0],
        percentage: (matrix[1][0] / total) * 100,
        fill: '#fbbf24'
      },
      {
        name: 'True Positive',
        value: matrix[1][1],
        percentage: (matrix[1][1] / total) * 100,
        fill: '#60a5fa'
      }
    ];
  };
  
  // Custom tooltip for ROC curve
  const RocTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">Threshold: {data.threshold.toFixed(2)}</p>
          <p>False Positive Rate: {(data.fpr * 100).toFixed(1)}%</p>
          <p>True Positive Rate: {(data.tpr * 100).toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for confusion matrix
  const ConfusionMatrixTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow-sm text-xs">
          <p className="font-medium">{data.name}</p>
          <p>Count: {data.value}</p>
          <p>Percentage: {data.percentage.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };
  
  // Active shape for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  
    return (
      <g>
        <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#333" className="text-xs">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#333" className="text-xs font-medium">
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  
  // State for active pie sector
  const [activePieIndex, setActivePieIndex] = useState(0);
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="confusion-matrix">Confusion Matrix</TabsTrigger>
          <TabsTrigger value="roc-curve">ROC Curve</TabsTrigger>
          <TabsTrigger value="performance-history">Performance History</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-20 text-red-500">
            <AlertCircle className="mr-2 h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <TabsContent value="overview" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
                    <CardDescription className="text-xs flex items-center">
                      Overall correctness
                      <HelpCircle className="h-3 w-3 ml-1 inline-block text-gray-400" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(metrics?.accuracy || 0)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Precision</CardTitle>
                    <CardDescription className="text-xs flex items-center">
                      True positives / predicted positives
                      <HelpCircle className="h-3 w-3 ml-1 inline-block text-gray-400" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(metrics?.precision || 0)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Recall</CardTitle>
                    <CardDescription className="text-xs flex items-center">
                      True positives / actual positives
                      <HelpCircle className="h-3 w-3 ml-1 inline-block text-gray-400" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(metrics?.recall || 0)}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">AUC</CardTitle>
                    <CardDescription className="text-xs flex items-center">
                      Area under ROC curve
                      <HelpCircle className="h-3 w-3 ml-1 inline-block text-gray-400" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatPercentage(metrics?.auc || 0)}</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card className="h-[350px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Confusion Matrix</CardTitle>
                    <CardDescription>
                      Distribution of predictions vs actual values
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          activeIndex={activePieIndex}
                          activeShape={renderActiveShape}
                          data={getConfusionMatrixData()}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          onMouseEnter={(_, index) => setActivePieIndex(index)}
                        >
                          {getConfusionMatrixData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<ConfusionMatrixTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card className="h-[350px]">
                  <CardHeader>
                    <CardTitle className="text-lg">ROC Curve</CardTitle>
                    <CardDescription>
                      True Positive Rate vs False Positive Rate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          type="number" 
                          dataKey="fpr" 
                          name="False Positive Rate" 
                          domain={[0, 1]}
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="tpr" 
                          name="True Positive Rate" 
                          domain={[0, 1]}
                          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                        />
                        <ZAxis range={[60]} />
                        <Tooltip content={<RocTooltip />} />
                        <Scatter 
                          name="ROC Points" 
                          data={rocCurveData?.data || []} 
                          fill="#8884d8"
                          line={{ stroke: '#8884d8', strokeWidth: 2 }}
                          lineType="joint"
                        />
                        {/* Reference line (random classifier) */}
                        <Scatter
                          name="Random"
                          data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                          fill="none"
                          line={{ stroke: '#ccc', strokeWidth: 1, strokeDasharray: '5 5' }}
                          lineType="joint"
                        />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="confusion-matrix" className="mt-0">
              <Card className="h-[500px]">
                <CardHeader>
                  <CardTitle>Confusion Matrix</CardTitle>
                  <CardDescription>
                    Detailed breakdown of model predictions vs actual values
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={getConfusionMatrixData()}
                          layout="vertical"
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="value" name="Count">
                            {getConfusionMatrixData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Interpretation</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-400 mr-2"></div>
                          <div>
                            <p className="font-medium">True Negative (TN)</p>
                            <p className="text-sm text-gray-500">Correctly identified non-cancer cases</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-red-400 mr-2"></div>
                          <div>
                            <p className="font-medium">False Positive (FP)</p>
                            <p className="text-sm text-gray-500">Non-cancer incorrectly identified as cancer</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-yellow-400 mr-2"></div>
                          <div>
                            <p className="font-medium">False Negative (FN)</p>
                            <p className="text-sm text-gray-500">Cancer incorrectly identified as non-cancer</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-400 mr-2"></div>
                          <div>
                            <p className="font-medium">True Positive (TP)</p>
                            <p className="text-sm text-gray-500">Correctly identified cancer cases</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">Key Metrics</h4>
                        <ul className="space-y-1 text-sm">
                          <li><span className="font-medium">Accuracy:</span> {formatPercentage(metrics?.accuracy || 0)}</li>
                          <li><span className="font-medium">Precision:</span> {formatPercentage(metrics?.precision || 0)}</li>
                          <li><span className="font-medium">Recall (Sensitivity):</span> {formatPercentage(metrics?.recall || 0)}</li>
                          <li><span className="font-medium">F1 Score:</span> {formatPercentage(metrics?.f1Score || 0)}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="roc-curve" className="mt-0">
              <Card className="h-[500px]">
                <CardHeader>
                  <CardTitle>ROC Curve</CardTitle>
                  <CardDescription>
                    Receiver Operating Characteristic curve showing model performance across different thresholds
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <ResponsiveContainer width="100%" height={350}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            type="number" 
                            dataKey="fpr" 
                            name="False Positive Rate" 
                            domain={[0, 1]}
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          />
                          <YAxis 
                            type="number" 
                            dataKey="tpr" 
                            name="True Positive Rate" 
                            domain={[0, 1]}
                            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                          />
                          <Tooltip content={<RocTooltip />} />
                          <Legend />
                          <Scatter 
                            name="ROC Points" 
                            data={rocCurveData?.data || []} 
                            fill="#8884d8"
                            line={{ stroke: '#8884d8', strokeWidth: 2 }}
                            lineType="joint"
                          />
                          {/* Reference line (random classifier) */}
                          <Scatter
                            name="Random Classifier"
                            data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]}
                            fill="none"
                            line={{ stroke: '#ccc', strokeWidth: 1, strokeDasharray: '5 5' }}
                            lineType="joint"
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Understanding ROC Curve</h3>
                      
                      <div className="space-y-2 text-sm">
                        <p>The ROC curve plots the True Positive Rate (sensitivity) against the False Positive Rate (1-specificity) at various threshold settings.</p>
                        
                        <div className="pt-2">
                          <p className="font-medium">Area Under Curve (AUC): {formatPercentage(rocCurveData?.auc || 0)}</p>
                          <p className="text-gray-500 mt-1">
                            AUC ranges from 0.5 (random classifier) to 1.0 (perfect classifier). 
                            Higher values indicate better model performance.
                          </p>
                        </div>
                        
                        <div className="pt-4 border-t mt-4">
                          <h4 className="font-medium mb-2">Interpretation</h4>
                          <ul className="space-y-2 list-disc pl-5">
                            <li>
                              <span className="font-medium">True Positive Rate (Sensitivity):</span> 
                              <span className="block text-gray-500">Proportion of actual positives correctly identified</span>
                            </li>
                            <li>
                              <span className="font-medium">False Positive Rate:</span> 
                              <span className="block text-gray-500">Proportion of actual negatives incorrectly identified as positive</span>
                            </li>
                            <li>
                              <span className="font-medium">Threshold:</span> 
                              <span className="block text-gray-500">Classification cutoff point that determines positive/negative prediction</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance-history" className="mt-0">
              <Card className="h-[500px]">
                <CardHeader>
                  <CardTitle>Performance History</CardTitle>
                  <CardDescription>
                    Model performance metrics over time as training improves
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart
                      data={performanceHistory}
                      margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0.5, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="accuracy" 
                        name="Accuracy" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="precision" 
                        name="Precision" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="recall" 
                        name="Recall" 
                        stroke="#ffc658" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default ModelPerformanceCharts;
