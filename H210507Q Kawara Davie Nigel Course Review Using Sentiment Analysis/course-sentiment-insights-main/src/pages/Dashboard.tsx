
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getCoursesWithLecturers, getAllFeedback, getActiveSemester } from "@/services/feedbackService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SentimentBadge } from "@/components/feedback/SentimentBadge";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [activeSemester, setActiveSemester] = useState<any>(null);
  
  const [courses, setCourses] = useState([]);
  const [allFeedback, setAllFeedback] = useState([]);
  
  // Load data on component mount
  useEffect(() => {
    const semester = getActiveSemester();
    setActiveSemester(semester);
    
    // Only get courses that have lecturers assigned
    const availableCourses = getCoursesWithLecturers();
    setCourses(availableCourses);
    
    const feedback = getAllFeedback();
    setAllFeedback(feedback);
  }, []);
  
  // Filter feedback to only show for this student
  const studentFeedback = user 
    ? allFeedback.filter(feedback => feedback.studentId === user.id)
    : [];
  
  // Get courses this student has given feedback for
  const feedbackCourseIds = new Set(studentFeedback.map(f => f.courseId));
  const coursesWithFeedback = courses.filter(course => feedbackCourseIds.has(course.id));
  const coursesWithoutFeedback = courses.filter(course => !feedbackCourseIds.has(course.id));
  
  const displayCourses = activeTab === "all" 
    ? courses 
    : activeTab === "with-feedback" 
      ? coursesWithFeedback 
      : coursesWithoutFeedback;
  
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name || "Student"}</h1>
          <p className="text-muted-foreground">
            View your courses and provide feedback
          </p>
          
          {activeSemester && (
            <div className="mt-2">
              <Badge variant="outline" className="text-sm">
                Current Semester: {activeSemester.name}
              </Badge>
            </div>
          )}
        </div>
        <Link to="/feedback">
          <Button>Give Feedback</Button>
        </Link>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="with-feedback">Given Feedback</TabsTrigger>
          <TabsTrigger value="without-feedback">Need Feedback</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {displayCourses.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">
                {activeTab === "all" 
                  ? "No courses available with lecturers assigned" 
                  : activeTab === "with-feedback" 
                    ? "You haven't given any feedback yet" 
                    : "No courses need feedback"}
              </h3>
              <p>
                {activeTab === "all" 
                  ? "Please check back later when lecturers claim courses" 
                  : activeTab === "with-feedback" 
                    ? "Select a course to share your thoughts" 
                    : "You've given feedback to all available courses"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCourses.map((course) => {
            const feedback = studentFeedback.find(f => f.courseId === course.id);
            const hasFeedback = !!feedback;
            
            return (
              <Card key={course.id} className="flex flex-col h-full transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{course.code}</span>
                    {hasFeedback && (
                      <SentimentBadge sentiment={feedback.sentiment} />
                    )}
                  </CardTitle>
                  <CardDescription>{course.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2">Lecturer: {course.lecturerName || "Not assigned"}</p>
                  
                  {hasFeedback && (
                    <div className="mt-2 text-sm">
                      <p className="line-clamp-3">{feedback.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted on {new Date(feedback.createdAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant={hasFeedback ? "outline" : "default"} className="w-full">
                    <Link to="/feedback" state={{ courseId: course.id, courseName: course.name }}>
                      {hasFeedback ? "Update Feedback" : "Give Feedback"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {activeTab === "all" && displayCourses.length > 0 && (
        <div className="mt-6">
          <p className="text-center text-sm text-muted-foreground">
            Showing {displayCourses.length} of {courses.length} courses
            {coursesWithFeedback.length > 0 && ` • Feedback given for ${coursesWithFeedback.length} courses`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
