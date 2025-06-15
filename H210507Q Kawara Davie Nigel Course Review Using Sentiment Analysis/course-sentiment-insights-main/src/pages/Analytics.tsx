
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import { 
  getAllCourses, 
  getAllFeedback,
  getSentimentStats, 
  getSentimentStatsByCourse,
  exportToExcel
} from "@/services/feedbackService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  
  const courses = getAllCourses();
  const feedbacks = getAllFeedback();
  const overallStats = getSentimentStats();
  
  // Course comparison data
  const courseComparisonData = courses.map(course => {
    const stats = getSentimentStatsByCourse(course.id);
    return {
      name: course.code,
      positive: stats.positive,
      neutral: stats.neutral,
      negative: stats.negative,
      totalFeedback: stats.total,
      positivePct: stats.positivePercentage,
      neutralPct: stats.neutralPercentage,
      negativePct: stats.negativePercentage,
    };
  });
  
  // Mock time series data - in a real app this would be based on actual dates
  const timeSeriesData = [
    { month: 'Jan', positive: 65, neutral: 28, negative: 7 },
    { month: 'Feb', positive: 59, neutral: 32, negative: 9 },
    { month: 'Mar', positive: 80, neutral: 15, negative: 5 },
    { month: 'Apr', positive: 55, neutral: 30, negative: 15 },
    { month: 'May', positive: 40, neutral: 35, negative: 25 },
    { month: 'Jun', positive: 70, neutral: 20, negative: 10 },
  ];
  
  // Sentiment distribution data
  const sentimentData = [
    { name: 'Positive', value: overallStats.positive, color: '#2c9e76' },
    { name: 'Neutral', value: overallStats.neutral, color: '#7c7c7c' },
    { name: 'Negative', value: overallStats.negative, color: '#e35757' },
  ];
  
  // Mock radar chart data for sentiment aspects
  const radarData = [
    { subject: 'Content', A: 120, B: 110, fullMark: 150 },
    { subject: 'Instructor', A: 98, B: 130, fullMark: 150 },
    { subject: 'Materials', A: 86, B: 130, fullMark: 150 },
    { subject: 'Assignments', A: 99, B: 100, fullMark: 150 },
    { subject: 'Grading', A: 85, B: 90, fullMark: 150 },
    { subject: 'Support', A: 65, B: 85, fullMark: 150 },
  ];
  
  const handleExport = () => {
    const result = exportToExcel();
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error("Failed to export data");
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sentiment Analytics</h1>
          <p className="text-muted-foreground">
            Detailed analysis of student feedback across all courses
          </p>
        </div>
        <Button onClick={handleExport} className="gap-2">
          <FileSpreadsheet size={16} />
          Export Report
        </Button>
      </div>
      
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Sentiment Trends</TabsTrigger>
          <TabsTrigger value="comparison">Course Comparison</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
        </TabsList>
        
        {/* Sentiment Trends */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Trends Over Time</CardTitle>
              <CardDescription>Tracking how sentiment has changed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={timeSeriesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke="#2c9e76" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="neutral" stroke="#7c7c7c" />
                    <Line type="monotone" dataKey="negative" stroke="#e35757" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Positive sentiment has generally increased over the last 6 months, with a slight dip in April-May.
              </p>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Feedback Volume</CardTitle>
              <CardDescription>Number of feedback submissions by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeSeriesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positive" stackId="a" name="Positive" fill="#2c9e76" />
                    <Bar dataKey="neutral" stackId="a" name="Neutral" fill="#7c7c7c" />
                    <Bar dataKey="negative" stackId="a" name="Negative" fill="#e35757" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Course Comparison */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sentiment by Course</CardTitle>
              <CardDescription>Compare sentiment distributions across different courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseComparisonData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="positivePct" name="Positive %" fill="#2c9e76" />
                    <Bar dataKey="neutralPct" name="Neutral %" fill="#7c7c7c" />
                    <Bar dataKey="negativePct" name="Negative %" fill="#e35757" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Feedback Volume by Course</CardTitle>
              <CardDescription>Total number of feedback submissions per course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={courseComparisonData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalFeedback" name="Total Feedback" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Distribution */}
        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overall Sentiment Distribution</CardTitle>
              <CardDescription>Percentage breakdown of feedback sentiment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-sentiment-positive">{overallStats.positivePercentage.toFixed(1)}%</div>
                  <div className="text-sm">Positive</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sentiment-neutral">{overallStats.neutralPercentage.toFixed(1)}%</div>
                  <div className="text-sm">Neutral</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-sentiment-negative">{overallStats.negativePercentage.toFixed(1)}%</div>
                  <div className="text-sm">Negative</div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Advanced Analysis */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aspect Analysis</CardTitle>
              <CardDescription>Comparison of different aspects of course feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="Course 1" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Course 2" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                This radar chart shows how different aspects of courses are rated based on sentiment analysis of specific topics.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
