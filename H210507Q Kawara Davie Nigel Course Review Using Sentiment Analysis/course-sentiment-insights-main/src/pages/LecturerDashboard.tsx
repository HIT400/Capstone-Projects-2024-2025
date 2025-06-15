
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  getCoursesByLecturer, 
  getAvailableCourses,
  getActiveSemester,
  claimCourseAsLecturer,
  unclaimCourseAsLecturer,
  getFeedbackByLecturer, 
  getSentimentStats, 
  getSentimentStatsByCourse,
  getSentimentStatsByLecturer,
  downloadCSV,
  Course,
  getRecommendationsForLecturer,
  getRecommendationsForCourse,
  Recommendation
} from "@/services/feedbackService";
import { SentimentBadge } from "@/components/feedback/SentimentBadge";
import { Download, ChevronDown, FileText, BarChart2, Plus, BookOpen, Check, X, LightbulbIcon, ThumbsUp, ThumbsDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const LecturerDashboard = () => {
  const { user } = useAuth();
  const [activeSemester, setActiveSemester] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [isCourseClaimDialogOpen, setIsCourseClaimDialogOpen] = useState(false);
  const [isRecommendationsDialogOpen, setIsRecommendationsDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string[]>([]);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("my-courses");
  const [selectedCourseForRecommendations, setSelectedCourseForRecommendations] = useState<string | null>(null);
  
  // Get courses assigned to the current lecturer
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  
  // Get feedback for this lecturer's courses
  const [lecturerFeedback, setLecturerFeedback] = useState<any[]>([]);
  
  // Recommendations
  const [lecturerRecommendations, setLecturerRecommendations] = useState<Recommendation[]>([]);
  const [courseRecommendations, setCourseRecommendations] = useState<Recommendation[]>([]);
  
  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);
  
  const loadData = () => {
    // Get active semester
    const semester = getActiveSemester();
    setActiveSemester(semester);
    
    // Get courses for this lecturer
    const lecturerCourses = getCoursesByLecturer(user?.id || "");
    setMyCourses(lecturerCourses);
    
    // Get available courses for claiming
    const available = getAvailableCourses(semester?.id);
    setAvailableCourses(available);
    
    // Get feedback
    const feedback = getFeedbackByLecturer(user?.id || "");
    setLecturerFeedback(feedback);
    
    // Get recommendations for lecturer
    if (user) {
      const recommendations = getRecommendationsForLecturer(user.id);
      setLecturerRecommendations(recommendations);
    }
  };
  
  const filteredFeedback = selectedCourseFilter === "all" 
    ? lecturerFeedback 
    : lecturerFeedback.filter(f => f.courseId === selectedCourseFilter);
  
  // Get sentiment stats for this lecturer
  const sentimentStats = user ? getSentimentStatsByLecturer(user.id) : {
    total: 0,
    positive: 0,
    negative: 0,
    neutral: 0,
    positivePercentage: 0,
    neutralPercentage: 0,
    negativePercentage: 0
  };
  
  const toggleFeedbackExpansion = (id: string) => {
    setExpandedFeedback(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  
  const viewDetailedFeedback = (feedback: any) => {
    setSelectedFeedback(feedback);
    setIsDialogOpen(true);
  };
  
  const openAnalytics = () => {
    setIsAnalyticsDialogOpen(true);
  };
  
  const openCourseClaimDialog = () => {
    setIsCourseClaimDialogOpen(true);
  };
  
  const openRecommendationsDialog = (courseId?: string) => {
    if (courseId) {
      setSelectedCourseForRecommendations(courseId);
      const recommendations = getRecommendationsForCourse(courseId);
      setCourseRecommendations(recommendations);
    } else {
      setSelectedCourseForRecommendations(null);
      setCourseRecommendations([]);
    }
    setIsRecommendationsDialogOpen(true);
  };
  
  const handleClaimCourse = (courseId: string) => {
    if (!user) return;
    
    try {
      claimCourseAsLecturer(courseId, user.id, user.name);
      toast.success("Course claimed successfully");
      loadData(); // Refresh data
    } catch (error) {
      toast.error("Failed to claim course");
    }
  };
  
  const handleUnclaimCourse = (courseId: string) => {
    if (!user) return;
    
    try {
      unclaimCourseAsLecturer(courseId, user.id);
      toast.success("Course unclaimed successfully");
      loadData(); // Refresh data
    } catch (error) {
      toast.error("Failed to unclaim course");
    }
  };
  
  const handleDownloadFeedback = () => {
    // Make sure we're only exporting feedback for this lecturer's courses
    if (filteredFeedback.length === 0) {
      toast.error("No feedback data to download");
      return;
    }
    
    try {
      const filename = selectedCourseFilter === "all" 
        ? `all-my-courses-feedback.csv` 
        : `course-${selectedCourseFilter}-feedback.csv`;
      
      // Only download the filteredFeedback (which contains only feedback for this lecturer's courses)
      downloadCSV(filteredFeedback, filename);
      toast.success(`${filteredFeedback.length} feedback entries downloaded successfully`);
    } catch (error) {
      toast.error("Failed to download feedback data");
    }
  };
  
  // Prepare data for pie chart
  const prepareSentimentData = () => {
    return [
      { name: "Positive", value: sentimentStats.positive, color: "#2c9e76" },
      { name: "Neutral", value: sentimentStats.neutral, color: "#7c7c7c" },
      { name: "Negative", value: sentimentStats.negative, color: "#e35757" }
    ];
  };
  
  // Prepare course comparison data for bar chart
  const prepareCourseComparisonData = () => {
    return myCourses.map(course => {
      const stats = getSentimentStatsByCourse(course.id);
      return {
        name: course.code,
        positive: stats.positive,
        neutral: stats.neutral,
        negative: stats.negative
      };
    });
  };

  // Function to render recommendation icons based on type
  const renderRecommendationIcon = (type: string) => {
    switch (type) {
      case 'improvement':
        return <ThumbsDown className="text-red-500 h-5 w-5" />;
      case 'strength':
        return <ThumbsUp className="text-green-500 h-5 w-5" />;
      case 'suggestion':
        return <LightbulbIcon className="text-amber-500 h-5 w-5" />;
      default:
        return <LightbulbIcon className="text-blue-500 h-5 w-5" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">
            View and analyze feedback for the courses you teach.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={openCourseClaimDialog} variant="outline" className="flex items-center gap-2">
            <Plus size={16} />
            <span>Claim Courses</span>
          </Button>
          <Button onClick={openAnalytics} variant="outline" className="flex items-center gap-2">
            <BarChart2 size={16} />
            <span>Analytics Dashboard</span>
          </Button>
          <Button onClick={() => openRecommendationsDialog()} variant="outline" className="flex items-center gap-2">
            <LightbulbIcon size={16} />
            <span>Teaching Recommendations</span>
          </Button>
          <Button onClick={handleDownloadFeedback} variant="outline" className="flex items-center gap-2">
            <Download size={16} />
            <span>Export Feedback</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
          <TabsTrigger value="available-courses">Available Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-courses" className="mt-6">
          {myCourses.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center text-muted-foreground">
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p>You are not assigned as an instructor to any courses yet.</p>
                  <Button 
                    onClick={openCourseClaimDialog} 
                    variant="outline" 
                    className="mt-4"
                  >
                    Claim Courses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Feedback</CardTitle>
                    <CardDescription>All feedback across your courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold">{sentimentStats.total}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Positive Feedback</CardTitle>
                    <CardDescription>Percentage of positive reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-green-600">
                      {sentimentStats.positivePercentage.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Negative Feedback</CardTitle>
                    <CardDescription>Percentage of negative reviews</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-red-600">
                      {sentimentStats.negativePercentage.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Sentiment Distribution</CardTitle>
                    <CardDescription>Overall sentiment across all your courses</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {sentimentStats.total > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareSentimentData()}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => {
                              if (typeof percent !== 'number') return '';
                              return percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : '';
                            }}
                          >
                            {prepareSentimentData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => (typeof value === 'number' ? value : '0')} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">No feedback data available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Your Courses</CardTitle>
                    <CardDescription>Courses you're teaching</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {myCourses.map(course => {
                        const courseStats = getSentimentStatsByCourse(course.id);
                        const courseFeedbackCount = courseStats.total;
                        
                        return (
                          <div key={course.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{course.code}</h3>
                                <p className="text-sm text-muted-foreground">{course.name}</p>
                              </div>
                              <div className="text-right flex items-center gap-2">
                                <div>
                                  <div className="text-sm"><span className="font-medium">{courseFeedbackCount}</span> feedbacks</div>
                                  {courseFeedbackCount > 0 && (
                                    <div className="flex gap-2 mt-1">
                                      <span className="text-xs text-green-600">{courseStats.positivePercentage.toFixed(0)}% 👍</span>
                                      <span className="text-xs text-red-600">{courseStats.negativePercentage.toFixed(0)}% 👎</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  {courseFeedbackCount > 0 && (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openRecommendationsDialog(course.id)}
                                    >
                                      <LightbulbIcon size={14} className="text-amber-500" />
                                    </Button>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleUnclaimCourse(course.id)}
                                  >
                                    <X size={14} className="text-red-600" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {lecturerRecommendations.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LightbulbIcon className="h-5 w-5 text-amber-500" /> 
                      Teaching Recommendations
                    </CardTitle>
                    <CardDescription>Based on student feedback analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {lecturerRecommendations.slice(0, 3).map((recommendation) => (
                        <div key={recommendation.id} className="flex gap-3 p-3 border rounded-md items-start">
                          {renderRecommendationIcon(recommendation.type)}
                          <div>
                            <p className="text-sm">{recommendation.text}</p>
                            <p className="text-xs text-muted-foreground capitalize mt-1">
                              {recommendation.type === 'improvement' ? 'Area for improvement' :
                               recommendation.type === 'strength' ? 'Strength to leverage' : 'Teaching suggestion'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {lecturerRecommendations.length > 3 && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => openRecommendationsDialog()}
                        >
                          View All {lecturerRecommendations.length} Recommendations
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Feedback</CardTitle>
                    <CardDescription>Latest feedback for your courses</CardDescription>
                  </div>
                  <Select defaultValue="all" value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by Course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {myCourses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredFeedback.length > 0 ? (
                      filteredFeedback.slice(0, 5).map(feedback => {
                        const course = myCourses.find(c => c.id === feedback.courseId);
                        const isExpanded = expandedFeedback.includes(feedback.id);
                        
                        return (
                          <div key={feedback.id} className="border rounded-lg p-4 transition-all">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{course?.code}: {course?.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(feedback.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <SentimentBadge sentiment={feedback.sentiment} />
                            </div>
                            
                            <div className={`mt-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
                              <p className="text-sm">{feedback.text}</p>
                            </div>
                            
                            <div className="flex justify-between items-center mt-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="p-0 h-auto text-xs flex items-center"
                                onClick={() => toggleFeedbackExpansion(feedback.id)}
                              >
                                <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => viewDetailedFeedback(feedback)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-10 text-muted-foreground">
                        <p>No feedback has been submitted for your courses yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t">
                  <Button variant="outline" className="gap-2" onClick={handleDownloadFeedback}>
                    <Download size={16} />
                    Export to CSV ({filteredFeedback.length} entries)
                  </Button>
                </CardFooter>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="available-courses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>
                {activeSemester ? 
                  `Courses available for claiming in ${activeSemester.name} semester` : 
                  "Available courses for claiming"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableCourses.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No available courses to claim at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCourses.map(course => (
                    <Card key={course.id} className="border">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">{course.code}</CardTitle>
                          <Badge variant="outline">Available</Badge>
                        </div>
                        <CardDescription>{course.name}</CardDescription>
                      </CardHeader>
                      <CardFooter className="pt-3">
                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => handleClaimCourse(course.id)}
                        >
                          <Check size={14} className="mr-1" />
                          Claim Course
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Detailed Feedback Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedFeedback && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detailed Feedback</DialogTitle>
              <DialogDescription>
                {myCourses.find(c => c.id === selectedFeedback.courseId)?.code} - 
                {new Date(selectedFeedback.createdAt).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Sentiment Analysis</h4>
                <SentimentBadge sentiment={selectedFeedback.sentiment} />
              </div>
              <div>
                <h4 className="font-medium mb-1">Feedback Text</h4>
                <p className="text-sm bg-secondary/50 p-4 rounded-md">{selectedFeedback.text}</p>
              </div>
              {selectedFeedback.keywords && (
                <div>
                  <h4 className="font-medium mb-1">Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeedback.keywords.map((keyword: string, idx: number) => (
                      <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-md">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Claim Course Dialog */}
      <Dialog open={isCourseClaimDialogOpen} onOpenChange={setIsCourseClaimDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Claim Courses</DialogTitle>
            <DialogDescription>
              Select courses you'd like to teach this semester
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {activeSemester && (
              <p className="mb-4">
                Current Semester: <Badge>{activeSemester.name}</Badge>
              </p>
            )}
            
            {availableCourses.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No available courses to claim at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCourses.map(course => (
                  <Card key={course.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{course.code}</CardTitle>
                        <Badge variant="outline">Available</Badge>
                      </div>
                      <CardDescription>{course.name}</CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-3">
                      <Button 
                        className="w-full" 
                        size="sm"
                        onClick={() => {
                          handleClaimCourse(course.id);
                          if (availableCourses.length === 1) {
                            setIsCourseClaimDialogOpen(false);
                          }
                        }}
                      >
                        <Check size={14} className="mr-1" />
                        Claim Course
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsCourseClaimDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Analytics Dashboard Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analytics Dashboard</DialogTitle>
            <DialogDescription>
              Detailed analytics for your courses
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-8 py-4">
            {/* Sentiment Distribution */}
            <div>
              <h3 className="text-lg font-medium mb-4">Overall Sentiment Distribution</h3>
              <div className="h-72">
                {sentimentStats.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareSentimentData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {prepareSentimentData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No feedback data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Per-Course Comparison */}
            <div>
              <h3 className="text-lg font-medium mb-4">Feedback by Course</h3>
              <div className="h-72">
                {myCourses.length > 0 && lecturerFeedback.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareCourseComparisonData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="positive" stackId="a" fill="#2c9e76" name="Positive" />
                      <Bar dataKey="neutral" stackId="a" fill="#7c7c7c" name="Neutral" />
                      <Bar dataKey="negative" stackId="a" fill="#e35757" name="Negative" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No course comparison data available</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Download Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">Download Reports</h3>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleDownloadFeedback}
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={lecturerFeedback.length === 0}
                >
                  <FileText size={16} />
                  <span>Download All My Feedback ({lecturerFeedback.length})</span>
                </Button>
                {myCourses.map(course => {
                  const courseFeedback = lecturerFeedback.filter(f => f.courseId === course.id);
                  return (
                    <Button 
                      key={course.id}
                      onClick={() => {
                        downloadCSV(courseFeedback, `${course.code}-feedback.csv`);
                        toast.success(`${courseFeedback.length} feedback entries downloaded for ${course.code}`);
                      }}
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={courseFeedback.length === 0}
                    >
                      <Download size={16} />
                      <span>{course.code} ({courseFeedback.length})</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Recommendations Dialog */}
      <Dialog open={isRecommendationsDialogOpen} onOpenChange={setIsRecommendationsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-amber-500" />
              {selectedCourseForRecommendations ? 
                `Recommendations for ${myCourses.find(c => c.id === selectedCourseForRecommendations)?.code}` : 
                "Teaching Recommendations"
              }
            </DialogTitle>
            <DialogDescription>
              {selectedCourseForRecommendations ? 
                "Course-specific recommendations based on student feedback" :
                "Overall teaching recommendations across all your courses"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {selectedCourseForRecommendations ? (
              courseRecommendations.length > 0 ? (
                courseRecommendations.map(recommendation => (
                  <div key={recommendation.id} className="flex gap-3 p-4 border rounded-md items-start">
                    {renderRecommendationIcon(recommendation.type)}
                    <div>
                      <p className="text-sm">{recommendation.text}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {recommendation.type === 'improvement' ? 'Area for improvement' :
                         recommendation.type === 'strength' ? 'Strength to leverage' : 'Teaching suggestion'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No recommendations available for this course yet. This could be because there's not enough feedback.</p>
                </div>
              )
            ) : (
              lecturerRecommendations.length > 0 ? (
                lecturerRecommendations.map(recommendation => (
                  <div key={recommendation.id} className="flex gap-3 p-4 border rounded-md items-start">
                    {renderRecommendationIcon(recommendation.type)}
                    <div>
                      <p className="text-sm">{recommendation.text}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">
                        {recommendation.type === 'improvement' ? 'Area for improvement' :
                         recommendation.type === 'strength' ? 'Strength to leverage' : 'Teaching suggestion'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No recommendations available yet. This could be because there's not enough feedback across your courses.</p>
                </div>
              )
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsRecommendationsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LecturerDashboard;
