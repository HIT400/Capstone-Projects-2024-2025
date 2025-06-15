// Types
import { User } from "../context/AuthContext";
export type Sentiment = "positive" | "neutral" | "negative";
export type UserRole = "admin" | "student" | "lecturer";

export interface Feedback {
  id: string;
  courseId: string;
  courseName: string;
  studentId: string;
  studentName: string;
  text: string;
  sentiment: Sentiment;
  sentimentScore: number;
  createdAt: string;
  keywords?: string[];
}

export interface Course {
  id: string;
  code: string;
  name: string;
  semesterId: string;
  lecturerId?: string;
  lecturerName?: string;
}

export interface Semester {
  id: string;
  name: string;
  isActive: boolean;
}

// Data storage
const semesters: Semester[] = [
  {
    id: "1",
    name: "1.1",
    isActive: true
  },
  {
    id: "2",
    name: "2.2",
    isActive: false
  }
];

// Real course data - now with semesterId
const courses: Course[] = [
  {
    id: "1",
    code: "ISE4201",
    name: "Human Computer Interaction",
    semesterId: "1",
    lecturerId: "",
    lecturerName: "",
  },
  {
    id: "2",
    code: "ISE4202",
    name: "Theory of Computation",
    semesterId: "1",
    lecturerId: "",
    lecturerName: "",
  },
  {
    id: "3",
    code: "ISE4203",
    name: "Artificial Intelligence",
    semesterId: "1",
    lecturerId: "",
    lecturerName: "",
  },
  {
    id: "4",
    code: "ISE4204",
    name: "Cloud Computing",
    semesterId: "2",
    lecturerId: "",
    lecturerName: "",
  },
  {
    id: "5",
    code: "ISE4205",
    name: "Systems Security and Cryptography",
    semesterId: "2",
    lecturerId: "",
    lecturerName: "",
  },
];

// Empty feedback array for production
const feedbacks: Feedback[] = [];

// Service functions
export const getAllFeedback = (): Feedback[] => {
  return [...feedbacks];
};

export const getFeedbackByCourse = (courseId: string): Feedback[] => {
  return feedbacks.filter((feedback) => feedback.courseId === courseId);
};

export const getFeedbackByLecturer = (lecturerId: string): Feedback[] => {
  // Get all courses taught by this lecturer
  const lecturerCourses = courses.filter(course => course.lecturerId === lecturerId);
  
  // Get feedback for these courses
  return feedbacks.filter(feedback => 
    lecturerCourses.some(course => course.id === feedback.courseId)
  );
};

export const getAllCourses = (): Course[] => {
  return [...courses];
};

export const getCoursesWithLecturers = (): Course[] => {
  return courses.filter(course => course.lecturerId && course.lecturerId !== "");
};

export const getCoursesWithoutLecturers = (): Course[] => {
  return courses.filter(course => !course.lecturerId || course.lecturerId === "");
};

export const getCoursesByLecturer = (lecturerId: string): Course[] => {
  return courses.filter(course => course.lecturerId === lecturerId);
};

export const getAvailableCourses = (semesterId?: string): Course[] => {
  if (semesterId) {
    return courses.filter(course => 
      course.semesterId === semesterId && 
      (!course.lecturerId || course.lecturerId === "")
    );
  }
  return courses.filter(course => !course.lecturerId || course.lecturerId === "");
};

export const getCourseById = (courseId: string): Course | undefined => {
  return courses.find((course) => course.id === courseId);
};

export const getAllSemesters = (): Semester[] => {
  return [...semesters];
};

export const getActiveSemester = (): Semester | undefined => {
  return semesters.find(semester => semester.isActive);
};

export const getSemesterById = (id: string): Semester | undefined => {
  return semesters.find(semester => semester.id === id);
};

export const addSemester = (name: string): Semester => {
  const newSemester: Semester = {
    id: (semesters.length + 1).toString(),
    name,
    isActive: false
  };
  
  semesters.push(newSemester);
  return newSemester;
};

export const setActiveSemester = (id: string): Semester => {
  // First set all semesters to inactive
  semesters.forEach(semester => semester.isActive = false);
  
  // Then set the specified semester to active
  const semesterIndex = semesters.findIndex(semester => semester.id === id);
  
  if (semesterIndex === -1) {
    throw new Error("Semester not found");
  }
  
  semesters[semesterIndex].isActive = true;
  return semesters[semesterIndex];
};

export const addCourse = (code: string, name: string, semesterId: string): Course => {
  const newCourse: Course = {
    id: (courses.length + 1).toString(),
    code,
    name,
    semesterId
  };
  
  courses.push(newCourse);
  return newCourse;
};

export const updateCourse = (id: string, code: string, name: string, semesterId: string): Course => {
  const courseIndex = courses.findIndex(course => course.id === id);
  
  if (courseIndex === -1) {
    throw new Error("Course not found");
  }
  
  const updatedCourse: Course = {
    ...courses[courseIndex],
    code,
    name,
    semesterId
  };
  
  courses[courseIndex] = updatedCourse;
  return updatedCourse;
};

export const deleteCourse = (id: string): void => {
  const courseIndex = courses.findIndex(course => course.id === id);
  
  if (courseIndex === -1) {
    throw new Error("Course not found");
  }
  
  courses.splice(courseIndex, 1);
};

export const claimCourseAsLecturer = (courseId: string, lecturerId: string, lecturerName: string): Course => {
  const courseIndex = courses.findIndex(course => course.id === courseId);
  
  if (courseIndex === -1) {
    throw new Error("Course not found");
  }
  
  // Check if course is already claimed by another lecturer
  if (courses[courseIndex].lecturerId && courses[courseIndex].lecturerId !== lecturerId) {
    throw new Error("Course already assigned to another lecturer");
  }
  
  courses[courseIndex].lecturerId = lecturerId;
  courses[courseIndex].lecturerName = lecturerName;
  return courses[courseIndex];
};

export const unclaimCourseAsLecturer = (courseId: string, lecturerId: string): Course => {
  const courseIndex = courses.findIndex(course => course.id === courseId);
  
  if (courseIndex === -1) {
    throw new Error("Course not found");
  }
  
  // Check if course is claimed by the lecturer making the request
  if (courses[courseIndex].lecturerId !== lecturerId) {
    throw new Error("Course is not assigned to this lecturer");
  }
  
  courses[courseIndex].lecturerId = "";
  courses[courseIndex].lecturerName = "";
  return courses[courseIndex];
};

export const analyzeSentiment = (text: string): { sentiment: Sentiment; score: number } => {
  // This is a sentiment analysis function
  // In a real application, this would call an API or use a library
  
  // Simple word-based sentiment analysis for demo purposes
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'helpful', 'best', 'enjoyed', 'clear', 'engaging'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worst', 'difficult', 'confusing', 'unclear', 'frustrated', 'disappointing', 'lacking'];
  
  const words = text.toLowerCase().split(/\W+/);
  
  let score = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) {
      score += 1;
      positiveCount++;
    } else if (negativeWords.includes(word)) {
      score -= 1;
      negativeCount++;
    }
  });
  
  const normalizedScore = score / Math.max(1, words.length / 5); // Normalize by approximate sentence count
  
  let sentiment: Sentiment;
  if (normalizedScore > 0.2) {
    sentiment = "positive";
  } else if (normalizedScore < -0.2) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }
  
  return {
    sentiment,
    score: normalizedScore
  };
};

export const extractKeywords = (text: string): string[] => {
  // In a production app, this would use NLP techniques or an API
  // For demo purposes, we'll use a simple extraction method
  const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 3);
  const stopWords = ['this', 'that', 'these', 'those', 'they', 'their', 'there', 'were', 'when', 'with', 'what'];
  
  // Filter out common words and get unique words
  const filteredWords = words.filter(word => !stopWords.includes(word));
  
  // Get unique words and take top 5
  return [...new Set(filteredWords)].slice(0, 5);
};

export const addFeedback = (
  courseId: string,
  text: string,
  studentId: string,
  studentName: string
): Feedback => {
  const course = getCourseById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }
  
  const { sentiment, score } = analyzeSentiment(text);
  const keywords = extractKeywords(text);
  
  const newFeedback: Feedback = {
    id: (feedbacks.length + 1).toString(),
    courseId,
    courseName: course.name,
    studentId,
    studentName,
    text,
    sentiment,
    sentimentScore: score,
    createdAt: new Date().toISOString(),
    keywords
  };
  
  feedbacks.push(newFeedback);
  return newFeedback;
};

export const getSentimentStats = () => {
  const total = feedbacks.length;
  
  if (total === 0) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      positivePercentage: 0,
      neutralPercentage: 0,
      negativePercentage: 0,
    };
  }
  
  const positive = feedbacks.filter(f => f.sentiment === "positive").length;
  const neutral = feedbacks.filter(f => f.sentiment === "neutral").length;
  const negative = feedbacks.filter(f => f.sentiment === "negative").length;
  
  return {
    total,
    positive,
    negative,
    neutral,
    positivePercentage: (positive / total) * 100,
    neutralPercentage: (neutral / total) * 100,
    negativePercentage: (negative / total) * 100,
  };
};

export const getSentimentStatsByCourse = (courseId: string) => {
  const courseFeedbacks = feedbacks.filter(f => f.courseId === courseId);
  const total = courseFeedbacks.length;
  
  if (total === 0) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      positivePercentage: 0,
      neutralPercentage: 0,
      negativePercentage: 0,
    };
  }
  
  const positive = courseFeedbacks.filter(f => f.sentiment === "positive").length;
  const neutral = courseFeedbacks.filter(f => f.sentiment === "neutral").length;
  const negative = courseFeedbacks.filter(f => f.sentiment === "negative").length;
  
  return {
    total,
    positive,
    negative,
    neutral,
    positivePercentage: (positive / total) * 100,
    neutralPercentage: (neutral / total) * 100,
    negativePercentage: (negative / total) * 100,
  };
};

export const getSentimentStatsByLecturer = (lecturerId: string) => {
  const lecturerFeedbacks = getFeedbackByLecturer(lecturerId);
  const total = lecturerFeedbacks.length;
  
  if (total === 0) {
    return {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      positivePercentage: 0,
      neutralPercentage: 0,
      negativePercentage: 0,
    };
  }
  
  const positive = lecturerFeedbacks.filter(f => f.sentiment === "positive").length;
  const neutral = lecturerFeedbacks.filter(f => f.sentiment === "neutral").length;
  const negative = lecturerFeedbacks.filter(f => f.sentiment === "negative").length;
  
  return {
    total,
    positive,
    negative,
    neutral,
    positivePercentage: (positive / total) * 100,
    neutralPercentage: (neutral / total) * 100,
    negativePercentage: (negative / total) * 100,
  };
};

// Recommendations for lecturers based on sentiment analysis
export interface Recommendation {
  id: string;
  type: 'improvement' | 'strength' | 'suggestion';
  text: string;
}

export const getRecommendationsForCourse = (courseId: string): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const feedback = getFeedbackByCourse(courseId);
  const stats = getSentimentStatsByCourse(courseId);
  
  // If there's no feedback, return empty recommendations
  if (feedback.length === 0) {
    return recommendations;
  }
  
  // Analyze negative feedback for improvement recommendations
  if (stats.negative > 0) {
    const negativeFeedback = feedback.filter(f => f.sentiment === "negative");
    
    // Look for common keywords or themes in negative feedback
    const keywords = negativeFeedback.flatMap(f => f.keywords || []);
    const keywordCounts = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Add improvement recommendations based on negative keywords
    if (keywordCounts['difficult'] || keywordCounts['confusing'] || keywordCounts['unclear']) {
      recommendations.push({
        id: '1',
        type: 'improvement',
        text: 'Consider simplifying complex topics and providing more examples to enhance clarity.'
      });
    }
    
    if (keywordCounts['slow'] || keywordCounts['boring']) {
      recommendations.push({
        id: '2',
        type: 'improvement',
        text: 'Try incorporating more interactive elements and varying the pace of lectures to boost engagement.'
      });
    }
    
    // General negative feedback recommendations
    if (stats.negativePercentage > 30) {
      recommendations.push({
        id: '3',
        type: 'improvement',
        text: 'Consider soliciting mid-semester feedback to address student concerns early.'
      });
    }
  }
  
  // Analyze positive feedback for strength recommendations
  if (stats.positive > 0) {
    const positiveFeedback = feedback.filter(f => f.sentiment === "positive");
    const keywords = positiveFeedback.flatMap(f => f.keywords || []);
    const keywordCounts = keywords.reduce((acc, keyword) => {
      acc[keyword] = (acc[keyword] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (keywordCounts['clear'] || keywordCounts['helpful']) {
      recommendations.push({
        id: '4',
        type: 'strength',
        text: 'Students appreciate your clear explanations. Continue emphasizing clarity in complex topics.'
      });
    }
    
    if (keywordCounts['engaging'] || keywordCounts['interesting']) {
      recommendations.push({
        id: '5',
        type: 'strength',
        text: 'Your engaging teaching style resonates well with students. Consider sharing these techniques with colleagues.'
      });
    }
  }
  
  // General suggestions based on overall feedback
  recommendations.push({
    id: '6',
    type: 'suggestion',
    text: 'Regular check-ins with students can help identify areas for improvement early in the semester.'
  });
  
  if (feedback.length < 5) {
    recommendations.push({
      id: '7',
      type: 'suggestion',
      text: 'Encourage more students to provide feedback to get a better representation of class sentiment.'
    });
  }
  
  return recommendations;
};

export const getRecommendationsForLecturer = (lecturerId: string): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  const lecturerCourses = getCoursesByLecturer(lecturerId);
  
  if (lecturerCourses.length === 0) {
    return recommendations;
  }
  
  // Get overall lecturer stats
  const stats = getSentimentStatsByLecturer(lecturerId);
  
  // Add general recommendations based on overall sentiment
  if (stats.total === 0) {
    recommendations.push({
      id: 'l1',
      type: 'suggestion',
      text: 'You have no feedback yet. Consider encouraging students to provide feedback to help improve your teaching.'
    });
    return recommendations;
  }
  
  // Add recommendations based on overall sentiment
  if (stats.negativePercentage > 30) {
    recommendations.push({
      id: 'l2',
      type: 'improvement',
      text: 'Consider reviewing your teaching methods as there seems to be room for improvement based on student feedback.'
    });
  } else if (stats.positivePercentage > 70) {
    recommendations.push({
      id: 'l3',
      type: 'strength',
      text: 'Your teaching methods are receiving positive feedback. Keep up the good work!'
    });
  }
  
  // Add course-specific recommendations
  lecturerCourses.forEach(course => {
    const courseFeedback = getFeedbackByCourse(course.id);
    if (courseFeedback.length > 0) {
      const courseStats = getSentimentStatsByCourse(course.id);
      
      if (courseStats.negativePercentage > 50) {
        recommendations.push({
          id: `c-${course.id}-1`,
          type: 'improvement',
          text: `Consider reviewing your approach for ${course.code} as it has a high rate of negative feedback.`
        });
      } else if (courseStats.positivePercentage > 80) {
        recommendations.push({
          id: `c-${course.id}-2`,
          type: 'strength',
          text: `Your approach for ${course.code} is working well with students. Consider applying similar methods to other courses.`
        });
      }
    }
  });
  
  // Add general teaching recommendations
  recommendations.push({
    id: 'l4',
    type: 'suggestion',
    text: 'Regular self-assessment and seeking peer review can help continuously improve teaching effectiveness.'
  });
  
  return recommendations;
};

// Function to export data as CSV
export const exportToCSV = (data: Feedback[]): string => {
  if (data.length === 0) {
    return '';
  }
  
  // CSV header
  const header = ['Course', 'Date', 'Feedback', 'Sentiment', 'Score'].join(',');
  
  // CSV rows
  const rows = data.map(feedback => {
    // Format date
    const date = new Date(feedback.createdAt).toLocaleDateString();
    
    // Handle special characters in text for CSV (escape quotes)
    const escapedText = feedback.text.replace(/"/g, '""');
    
    return [
      `"${feedback.courseName}"`,
      date,
      `"${escapedText}"`,
      feedback.sentiment,
      feedback.sentimentScore
    ].join(',');
  });
  
  return [header, ...rows].join('\n');
};

// Function to download data as a CSV file
export const downloadCSV = (data: Feedback[], filename: string = 'feedback-export.csv'): void => {
  const csv = exportToCSV(data);
  
  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a hidden link element to trigger download
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link attributes
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Append to document, trigger click and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to export data to Excel (for compatibility with existing imports)
export const exportToExcel = (): { success: boolean; message: string } => {
  try {
    // Get all feedback data
    const data = getAllFeedback();
    
    // If there's no data, return early
    if (data.length === 0) {
      return { 
        success: false, 
        message: "No data available to export" 
      };
    }
    
    // Use the CSV download function
    downloadCSV(data, 'feedback-export.csv');
    
    return { 
      success: true, 
      message: "Data exported successfully" 
    };
  } catch (error) {
    console.error("Error exporting data:", error);
    return { 
      success: false, 
      message: "Failed to export data" 
    };
  }
};
