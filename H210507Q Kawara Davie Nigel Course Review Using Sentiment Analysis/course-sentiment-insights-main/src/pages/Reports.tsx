
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, FileSpreadsheet, FileText } from "lucide-react";
import { getAllCourses, exportToExcel, getAllFeedback } from "@/services/feedbackService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SentimentBadge } from "@/components/feedback/SentimentBadge";

const Reports = () => {
  const [reportType, setReportType] = useState("all-feedback");
  const [courseId, setCourseId] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const courses = getAllCourses();
  const feedbacks = getAllFeedback();
  
  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    try {
      const result = exportToExcel();
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Filter feedbacks based on selections
  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesCourse = courseId ? feedback.courseId === courseId : true;
    const feedbackDate = new Date(feedback.createdAt);
    const matchesDateFrom = dateFrom ? feedbackDate >= dateFrom : true;
    const matchesDateTo = dateTo ? feedbackDate <= dateTo : true;
    
    return matchesCourse && matchesDateFrom && matchesDateTo;
  });
  
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and export feedback reports for analysis
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Report Options</CardTitle>
            <CardDescription>Configure your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-feedback">All Feedback</SelectItem>
                  <SelectItem value="sentiment-summary">Sentiment Summary</SelectItem>
                  <SelectItem value="course-comparison">Course Comparison</SelectItem>
                  <SelectItem value="trend-analysis">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : <span>From date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : <span>To date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full gap-2" 
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                "Generating..."
              ) : (
                <>
                  <FileSpreadsheet size={16} />
                  Generate Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              Preview of the data that will be included in your export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="table">
              <TabsList className="mb-4">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Sentiment</TableHead>
                        <TableHead>Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedbacks.length > 0 ? (
                        filteredFeedbacks.slice(0, 10).map((feedback) => (
                          <TableRow key={feedback.id}>
                            <TableCell className="font-medium">{feedback.courseName}</TableCell>
                            <TableCell>{feedback.studentName}</TableCell>
                            <TableCell>{new Date(feedback.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <SentimentBadge sentiment={feedback.sentiment} />
                            </TableCell>
                            <TableCell>{feedback.sentimentScore.toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6">
                            No data found for the selected filters
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredFeedbacks.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Showing 10 of {filteredFeedbacks.length} results. Export to see all data.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="raw">
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-xs overflow-auto max-h-96">
                    {JSON.stringify(filteredFeedbacks.slice(0, 5), null, 2)}
                  </pre>
                </div>
                {filteredFeedbacks.length > 5 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Showing 5 of {filteredFeedbacks.length} results as JSON.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Total records: <span className="font-medium">{filteredFeedbacks.length}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <FileText size={16} />
                PDF
              </Button>
              <Button variant="outline" className="gap-2">
                <Download size={16} />
                CSV
              </Button>
              <Button className="gap-2">
                <FileSpreadsheet size={16} />
                Excel
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Saved Reports</CardTitle>
          <CardDescription>
            Previously generated reports and templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">March 2023 Feedback Summary</TableCell>
                  <TableCell>Sentiment Summary</TableCell>
                  <TableCell>03/15/2023</TableCell>
                  <TableCell>124</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">CS101 Course Report</TableCell>
                  <TableCell>Course Comparison</TableCell>
                  <TableCell>02/28/2023</TableCell>
                  <TableCell>56</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Q1 2023 Trend Analysis</TableCell>
                  <TableCell>Trend Analysis</TableCell>
                  <TableCell>04/02/2023</TableCell>
                  <TableCell>287</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
