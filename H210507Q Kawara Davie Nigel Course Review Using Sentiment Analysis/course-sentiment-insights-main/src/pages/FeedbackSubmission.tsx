
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { addFeedback, analyzeSentiment, getCoursesWithLecturers, Sentiment } from "@/services/feedbackService";
import { AlertTriangle, Check, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const FeedbackSubmission = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const courses = getCoursesWithLecturers(); // Changed from getAllCourses to getCoursesWithLecturers
  
  const [courseId, setCourseId] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewSentiment, setPreviewSentiment] = useState<{ sentiment: Sentiment; score: number } | null>(null);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setFeedbackText(text);
    
    if (text.length > 20) {
      // Only analyze if there's enough text
      const sentimentResult = analyzeSentiment(text);
      setPreviewSentiment(sentimentResult);
    } else {
      setPreviewSentiment(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!courseId) {
        toast.error("Please select a course");
        return;
      }
      
      if (feedbackText.trim().length < 10) {
        toast.error("Feedback text is too short");
        return;
      }
      
      // In a real app, we would use the user's actual ID and name
      const feedback = addFeedback(
        courseId,
        feedbackText,
        user?.id || "anonymous",
        user?.name || "Anonymous User"
      );
      
      toast.success("Feedback submitted successfully");
      setFeedbackText("");
      setCourseId("");
      setPreviewSentiment(null);
      
      // Navigate to dashboard after a short delay
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit Course Feedback</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Course Feedback Form</CardTitle>
          <CardDescription>
            Your feedback helps instructors improve course content and teaching methods.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="course">
                Select Course
              </label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name} {course.lecturerName && `(by ${course.lecturerName})`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-courses" disabled>
                      No courses available with lecturers assigned
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="feedback">
                Your Feedback
              </label>
              <Textarea
                id="feedback"
                value={feedbackText}
                onChange={handleTextChange}
                placeholder="Please share your thoughts about this course..."
                className="min-h-32"
              />
              
              {previewSentiment && (
                <div className={`mt-2 p-3 text-sm rounded-md flex items-start gap-2 ${
                  previewSentiment.sentiment === "positive" 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : previewSentiment.sentiment === "negative"
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-gray-50 text-gray-800 border border-gray-200"
                }`}>
                  {previewSentiment.sentiment === "positive" ? (
                    <Check size={18} className="mt-0.5 text-green-600" />
                  ) : previewSentiment.sentiment === "negative" ? (
                    <AlertTriangle size={18} className="mt-0.5 text-red-600" />
                  ) : (
                    <Info size={18} className="mt-0.5 text-gray-600" />
                  )}
                  <div>
                    <div className="font-medium mb-1">
                      {previewSentiment.sentiment === "positive" 
                        ? "This feedback appears positive" 
                        : previewSentiment.sentiment === "negative"
                        ? "This feedback appears negative"
                        : "This feedback appears neutral"}
                    </div>
                    <p>
                      {previewSentiment.sentiment === "positive" 
                        ? "Your feedback highlights good aspects of the course." 
                        : previewSentiment.sentiment === "negative"
                        ? "Your feedback indicates areas that may need improvement."
                        : "Your feedback is balanced or factual in nature."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting || !courseId || feedbackText.length < 10}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Sentiment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our system uses natural language processing to analyze the sentiment of your feedback. 
            This helps instructors understand overall student perceptions and identify areas for 
            improvement. Your feedback is analyzed automatically to categorize it as positive, 
            neutral, or negative.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackSubmission;
