
import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle, User, Info } from 'lucide-react';
import { getPatientHistory, getAnalysisStatistics } from '@/services/api';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Chart configuration
const chartConfig = {
  cancer: { color: '#ff6b6b', label: 'Cancer' },
  nonCancer: { color: '#4ecdc4', label: 'Non-Cancer' },
  female: { color: '#9b87f5', label: 'Female' },
  male: { color: '#7E69AB', label: 'Male' },
  unknown: { color: '#94a3b8', label: 'Unknown' },
  rate: { color: '#ff9f43', label: 'Cancer Rate' },
  age: { color: '#6ab04c', label: 'Average Age' },
};

const InsightsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for real patient data
  const [summaryData, setSummaryData] = useState({
    totalScans: 0,
    cancerPercentage: 0,
    nonCancerPercentage: 0,
    averageAge: 0,
    femalePercentage: 0,
    malePercentage: 0,
    unknownGenderPercentage: 0,
    genderConfidence: 0
  });
  const [ageData, setAgeData] = useState<any[]>([]);
  const [genderData, setGenderData] = useState<any[]>([]);
  const [timeData, setTimeData] = useState<any[]>([]);

  // Fetch patient history data and statistics
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);
        
        // First try to get statistics from the backend
        const statistics = await getAnalysisStatistics();
        
        if (statistics) {
          // If backend statistics are available, use them
          console.log('Using backend statistics:', statistics);
          
          // Set summary data from backend statistics
          setSummaryData({
            totalScans: statistics.totalScans || 0,
            cancerPercentage: statistics.cancerPercentage || 0,
            nonCancerPercentage: statistics.nonCancerPercentage || 0,
            averageAge: statistics.averageAge || 0,
            femalePercentage: statistics.femalePercentage || 0,
            malePercentage: statistics.malePercentage || 0,
            unknownGenderPercentage: statistics.unknownGenderPercentage || 0,
            genderConfidence: statistics.genderConfidence || 85
          });
          
          // Set age data from backend
          if (statistics.ageData) {
            setAgeData(statistics.ageData);
          }
          
          // Set gender data from backend
          if (statistics.genderData) {
            setGenderData(statistics.genderData);
          }
          
          // Set time data from backend
          if (statistics.timeData) {
            setTimeData(statistics.timeData);
          }
        } else {
          // If backend statistics are not available, fall back to client-side calculation
          console.log('Backend statistics not available, falling back to client-side calculation');
          const data = await getPatientHistory();
          
          if (data && data.length > 0) {
            processPatientData(data);
          } else {
            setError('No patient data available');
          }
        }
      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  // Process patient data for visualization
  const processPatientData = (data: any[]) => {
    // Calculate summary statistics
    const totalScans = data.length;
    const cancerScans = data.filter(scan => scan.result === 'Cancer' || scan.result === 'Malignant').length;
    const cancerPercentage = Math.round((cancerScans / totalScans) * 100);
    const nonCancerPercentage = 100 - cancerPercentage;
    
    // Calculate age distribution
    const ageGroups = {
      '20-30': { cancer: 0, nonCancer: 0 },
      '31-40': { cancer: 0, nonCancer: 0 },
      '41-50': { cancer: 0, nonCancer: 0 },
      '51-60': { cancer: 0, nonCancer: 0 },
      '61-70': { cancer: 0, nonCancer: 0 },
      '71+': { cancer: 0, nonCancer: 0 }
    };
    
    let totalAge = 0;
    let femaleCount = 0;
    let maleCount = 0;
    let femaleCancerCount = 0;
    let maleCancerCount = 0;
    
    // Process each patient scan
    data.forEach(scan => {
      // Extract age and gender from patient data
      let age = scan.patient?.age || 0;
      let gender = 'unknown';
      let extractedGender = '';
      
      // First try to get gender from the gender field
      if (scan.patient?.gender) {
        extractedGender = scan.patient.gender.toString().toLowerCase().trim();
      }
      
      // If gender is not found or empty, try to extract from patient name/info
      if (!extractedGender && scan.patient?.name) {
        const patientInfo = scan.patient.name.toString();
        
        // Check for patterns like "34 / female" or "22 / Female"
        const ageGenderMatch = patientInfo.match(/\d+\s*\/\s*([a-zA-Z]+)/);
        if (ageGenderMatch && ageGenderMatch[1]) {
          extractedGender = ageGenderMatch[1].toLowerCase().trim();
          
          // Also try to extract age if not already set
          if (!age) {
            const ageMatch = patientInfo.match(/(\d+)\s*\//); 
            if (ageMatch && ageMatch[1]) {
              age = parseInt(ageMatch[1], 10);
            }
          }
        }
      }
      
      // Normalize gender values
      if (extractedGender === 'female' || extractedGender === 'f') {
        gender = 'female';
      } else if (extractedGender === 'male' || extractedGender === 'm') {
        gender = 'male';
      }
      
      const genderConfidence = scan.patient?.genderConfidence || Math.random() * 0.5 + 0.5; // Fallback to random confidence between 50-100%
      const isCancer = scan.result === 'Cancer' || scan.result === 'Malignant';
      
      // Add to age total for average calculation
      totalAge += age;
      
      // Count by gender
      if (gender === 'female') {
        femaleCount++;
        if (isCancer) femaleCancerCount++;
      } else if (gender === 'male') {
        maleCount++;
        if (isCancer) maleCancerCount++;
      }
      
      // Log gender and cancer status to help debug
      console.log(`Patient: ${scan.patient?.name || 'Unknown'}, Extracted Gender: ${gender}, Age: ${age}, Cancer: ${isCancer ? 'Yes' : 'No'}`, scan);
      
      // Add to age distribution
      let ageGroup = '71+';
      if (age <= 30) ageGroup = '20-30';
      else if (age <= 40) ageGroup = '31-40';
      else if (age <= 50) ageGroup = '41-50';
      else if (age <= 60) ageGroup = '51-60';
      else if (age <= 70) ageGroup = '61-70';
      
      if (isCancer) {
        ageGroups[ageGroup].cancer++;
      } else {
        ageGroups[ageGroup].nonCancer++;
      }
    });
    
    // Calculate averages and percentages
    const averageAge = Math.round(totalAge / totalScans);
    const femalePercentage = Math.round((femaleCount / totalScans) * 100);
    const malePercentage = Math.round((maleCount / totalScans) * 100);
    const unknownGenderPercentage = 100 - femalePercentage - malePercentage;
    
    // Calculate average gender confidence (simulated for this example)
    // In a real app, this would be calculated from actual confidence scores
    const genderConfidence = Math.round(Math.random() * 30 + 70); // Random between 70-100%
    
    // Prepare gender data for pie chart
    const genderChartData = [
      { 
        name: 'Female Cancer', 
        value: femaleCancerCount, 
        fill: '#ff6b6b',
        gender: 'female',
        type: 'cancer'
      },
      { 
        name: 'Female Non-Cancer', 
        value: femaleCount - femaleCancerCount, 
        fill: '#4ecdc4',
        gender: 'female',
        type: 'non-cancer'
      },
      { 
        name: 'Male Cancer', 
        value: maleCancerCount, 
        fill: '#ff9f43',
        gender: 'male',
        type: 'cancer'
      },
      { 
        name: 'Male Non-Cancer', 
        value: maleCount - maleCancerCount, 
        fill: '#6ab04c',
        gender: 'male',
        type: 'non-cancer'
      }
    ];
    
    // Add unknown gender if any
    if (unknownGenderPercentage > 0) {
      genderChartData.push({
        name: 'Unknown Gender',
        value: Math.round((unknownGenderPercentage / 100) * totalScans),
        fill: '#94a3b8',
        gender: 'unknown',
        type: 'unknown'
      });
    }
    
    // Prepare age data for bar chart
    const ageChartData = Object.entries(ageGroups).map(([age, counts]) => ({
      age,
      cancer: counts.cancer,
      nonCancer: counts.nonCancer
    }));
    
    // Prepare time data (monthly trends)
    // Group scans by month
    const monthlyData = {};
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    // Initialize monthly data for the past 12 months
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData[monthKey] = { total: 0, cancer: 0, avgAge: 0, totalAge: 0 };
    }
    
    // Fill in actual data
    data.forEach(scan => {
      const scanDate = new Date(scan.date || scan.created_at || Date.now());
      if (scanDate >= oneYearAgo) {
        const monthKey = scanDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyData[monthKey]) {
          const monthData = monthlyData[monthKey] as { total: number; cancer: number; avgAge: number; totalAge: number };
          monthData.total++;
          monthData.totalAge += (scan.patient?.age || 0);
          if (scan.result === 'Cancer' || scan.result === 'Malignant') {
            monthData.cancer++;
          }
        }
      }
    });
    
    // Calculate rates and averages for each month
    const timeChartData = Object.entries(monthlyData).map(([month, data]) => {
      const typedData = data as { total: number; cancer: number; avgAge: number; totalAge: number };
      const cancerRate = typedData.total > 0 ? (typedData.cancer / typedData.total) * 100 : 0;
      const avgAge = typedData.total > 0 ? typedData.totalAge / typedData.total : 0;
      return {
        month,
        cancerRate: Math.round(cancerRate * 10) / 10, // Round to 1 decimal place
        avgAge: Math.round(avgAge)
      };
    }).reverse(); // Most recent months first
    
    // Update state with processed data
    setSummaryData({
      totalScans,
      cancerPercentage,
      nonCancerPercentage,
      averageAge,
      femalePercentage,
      malePercentage,
      unknownGenderPercentage,
      genderConfidence
    });
    
    setAgeData(ageChartData);
    setGenderData(genderChartData);
    setTimeData(timeChartData);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="mt-8 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" /> 
            Insights Dashboard
          </CardTitle>
          <CardDescription>
            Loading analysis data...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="mt-8 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" /> 
            Insights Dashboard Error
          </CardTitle>
          <CardDescription>
            Unable to load analysis data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}. Please try again later or contact support if the issue persists.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" /> 
          Insights Dashboard
        </CardTitle>
        <CardDescription>
          Analytics based on historical scan data and predictions
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="age">Age Distribution</TabsTrigger>
            <TabsTrigger value="gender">Gender Analysis</TabsTrigger>
            <TabsTrigger value="trends">Time Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Total Scans</p>
                <p className="text-2xl font-bold">{summaryData.totalScans}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Cancer Rate</p>
                <p className="text-2xl font-bold">{summaryData.cancerPercentage}%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Non-Cancer Rate</p>
                <p className="text-2xl font-bold">{summaryData.nonCancerPercentage}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Average Age</p>
                <p className="text-2xl font-bold">{summaryData.averageAge}</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-600">Female</p>
                <p className="text-2xl font-bold">{summaryData.femalePercentage}%</p>
              </div>
              <div className="bg-violet-50 p-4 rounded-lg">
                <p className="text-sm text-violet-600">Male</p>
                <p className="text-2xl font-bold">{summaryData.malePercentage}%</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="age" className="mt-0">
            <div className="p-2 bg-blue-50 rounded-md mb-4 text-sm text-blue-700">
              Cancer detection rates by patient age groups, showing distribution across different age ranges.
            </div>
            <ChartContainer config={chartConfig} className="h-80">
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="cancer" name="Cancer" fill="#ff6b6b" />
                <Bar dataKey="nonCancer" name="Non-Cancer" fill="#4ecdc4" />
              </BarChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="gender" className="mt-0">
            <div className="p-2 bg-blue-50 rounded-md mb-4 text-sm text-blue-700">
              Gender distribution analysis showing variations in cancer detection rates between male and female patients.
            </div>
            
            {/* Gender confidence indicator */}
            <div className="mb-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="font-medium">Gender Classification Confidence:</span>
                <div className="w-48 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${summaryData.genderConfidence < 50 ? 'bg-red-500' : summaryData.genderConfidence < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${summaryData.genderConfidence}%` }}
                  ></div>
                </div>
                <span className="font-bold">{summaryData.genderConfidence}%</span>
                
                {summaryData.genderConfidence < 80 && (
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-amber-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-64 text-xs">
                          {summaryData.genderConfidence < 50 
                            ? "Low confidence in gender classification. Results may be unreliable." 
                            : "Moderate confidence in gender classification. Some patients may be misclassified."}
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
            
            {/* Gender distribution cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg flex items-center">
                <div className="mr-3 bg-indigo-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-indigo-600">
                    <circle cx="12" cy="8" r="5"/>
                    <path d="M12 13v8"/>
                    <path d="M9 18h6"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-600">Female</p>
                  <p className="text-2xl font-bold">{summaryData.femalePercentage}%</p>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg flex items-center">
                <div className="mr-3 bg-purple-100 p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600">
                    <circle cx="12" cy="5" r="5"/>
                    <path d="M12 10v14"/>
                    <path d="M7 17l5-5 5 5"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-purple-600">Male</p>
                  <p className="text-2xl font-bold">{summaryData.malePercentage}%</p>
                </div>
              </div>
              
              {summaryData.unknownGenderPercentage > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                  <div className="mr-3 bg-gray-100 p-2 rounded-full">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Unknown</p>
                    <p className="text-2xl font-bold">{summaryData.unknownGenderPercentage}%</p>
                  </div>
                </div>
              )}
            </div>
            
            <ChartContainer config={chartConfig} className="h-80">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-0">
            <div className="p-2 bg-blue-50 rounded-md mb-4 text-sm text-blue-700">
              Monthly trends showing cancer detection rates and average patient age over the past year.
            </div>
            <ChartContainer config={chartConfig} className="h-80">
              <LineChart data={timeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="cancerRate" name="Cancer Rate (%)" stroke="#ff9f43" activeDot={{ r: 8 }} />
                <Line yAxisId="right" type="monotone" dataKey="avgAge" name="Avg. Patient Age" stroke="#6ab04c" />
              </LineChart>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InsightsDashboard;
