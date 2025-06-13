import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

const StudentWheelAssessmentChart = () => {
  const [chartData, setChartData] = useState([85, 72, 90, 65]); // Default values
  
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('studentChemistryStrengths');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          setChartData(parsedData);
        } else {
          console.error('Stored data is not an array, using default values.');
        }
      }
    } catch (error) {
      console.error('Error retrieving data from localStorage:', error);
    }
  }, []);
  
  // Chemistry topics to study based on category
  const studyTopics = {
    'Noble Gases': [
      { threshold: 60, topics: ['Basic properties of noble gases', 'Electron configuration of noble gases'] },
      { threshold: 75, topics: ['Real-world applications of noble gases', 'Chemical reactions involving noble gases'] },
      { threshold: 90, topics: ['Advanced noble gas compounds', 'Theoretical chemistry of noble gases'] }
    ],
    'Transition Metals': [
      { threshold: 60, topics: ['Basic properties of transition metals', 'Electron configuration in d-block elements'] },
      { threshold: 75, topics: ['Coordination compounds', 'Catalytic properties of transition metals'] },
      { threshold: 90, topics: ['Complex ion formation', 'Organometallic chemistry'] }
    ],
    'Lightest Elements': [
      { threshold: 60, topics: ['Properties of hydrogen and helium', 'Basic periodic trends'] },
      { threshold: 75, topics: ['Isotopes of hydrogen', 'Light element compounds'] },
      { threshold: 90, topics: ['Quantum mechanics of light atoms', 'Nuclear chemistry of light elements'] }
    ],
    'Reactive Metals': [
      { threshold: 60, topics: ['Alkali and alkaline earth metals', 'Basic redox reactions'] },
      { threshold: 75, topics: ['Reactivity series', 'Metal extraction methods'] },
      { threshold: 90, topics: ['Complex reactions of reactive metals', 'Industrial applications'] }
    ]
  };
  
  // Generate personalized feedback based on scores
  const generateFeedback = () => {
    const categories = ['Noble Gases', 'Transition Metals', 'Lightest Elements', 'Reactive Metals'];
    const feedback = [];
    
    // Find the weakest areas (below 75%)
    const weakAreas = chartData
      .map((score, index) => ({ score, category: categories[index] }))
      .filter(item => item.score < 75)
      .sort((a, b) => a.score - b.score);  // Sort from lowest to highest
    
    // Generate specific feedback
    if (weakAreas.length === 0) {
      feedback.push(
        <div className="feedback-excellent" key="excellent">
          <h3 className="text-green-600 font-bold">Excellent Work!</h3>
          <p>You're performing very well across all chemistry topics. To further enhance your knowledge, consider exploring:</p>
          <ul className="list-disc pl-5 mt-2">
            {categories.map((category, i) => (
              <li key={i}>{studyTopics[category][2].topics[0]}</li>
            ))}
          </ul>
        </div>
      );
    } else {
      // Focus on the weakest areas
      feedback.push(
        <div className="feedback-improvement" key="improvement">
          <h3 className="text-amber-600 font-bold">Areas for Improvement:</h3>
          <p>Based on your assessment, focus on these topics:</p>
          <ul className="list-disc pl-5 mt-2">
            {weakAreas.map((area, i) => {
              // Find appropriate topics based on score threshold
              const topicLevel = area.score < 60 ? 0 : 1;
              const recommendedTopics = studyTopics[area.category][topicLevel].topics;
              
              return (
                <li key={i} className="mb-2">
                  <span className="font-semibold">{area.category} ({area.score}%):</span>
                  <ul className="list-circle pl-5 mt-1">
                    {recommendedTopics.map((topic, j) => (
                      <li key={j}>{topic}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      );
    }
    
    // Add suggestions for strongest area
    const strongestArea = chartData
      .map((score, index) => ({ score, category: categories[index] }))
      .reduce((max, item) => max.score > item.score ? max : item);
      
    if (strongestArea.score >= 85) {
      feedback.push(
        <div className="feedback-strength mt-4" key="strength">
          <h3 className="text-blue-600 font-bold">Build on Your Strengths:</h3>
          <p>You're showing excellent understanding of {strongestArea.category} ({strongestArea.score}%). Consider:</p>
          <ul className="list-disc pl-5 mt-2">
            <li>Mentoring peers who need help with this topic</li>
            <li>Exploring advanced concepts: {studyTopics[strongestArea.category][2].topics.join(', ')}</li>
          </ul>
        </div>
      );
    }
    
    return feedback;
  };

  const options = {
    series: chartData,
    chart: {
      height: 390,
      type: 'radialBar',
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
          background: 'transparent',
          image: undefined,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '14px',
          },
          value: {
            show: true,
            fontSize: '16px',
            formatter: function(val) {
              return val + '%';
            }
          },
          total: {
            show: true,
            label: 'Average',
            formatter: function(w) {
              const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              const avg = Math.round(sum / w.globals.series.length);
              return avg + '%';
            }
          }
        },
      },
    },
    colors: ['#FF5733', '#33FF57', '#3380FF', '#FF33A6'],
    labels: ['Noble Gases', 'Transition Metals', 'Lightest Elements', 'Reactive Metals'],
    legend: {
      show: true,
      position: 'bottom',
      fontSize: '14px',
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            show: true,
          },
        },
      },
    ],
  };

  // Helper function to determine overall performance status
  const getOverallStatus = () => {
    const average = chartData.reduce((sum, score) => sum + score, 0) / chartData.length;
    if (average >= 90) return { text: "Excellent", color: "text-green-600" };
    if (average >= 75) return { text: "Good", color: "text-blue-600" };
    if (average >= 60) return { text: "Satisfactory", color: "text-amber-600" };
    return { text: "Needs Improvement", color: "text-red-600" };
  };

  const status = getOverallStatus();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Student Chemistry Strengths Assessment
        </h2>
        <p className={`mt-2 text-lg font-medium ${status.color}`}>
          Overall: {status.text}
        </p>
      </div>
      
      <Chart options={options} series={options.series} type="radialBar" height={390} />
      
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-gray-700 mb-3">Personalized Feedback</h3>
        {generateFeedback()}
        
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Study Tips:</h3>
          <ul className="list-disc pl-5 mt-2">
            <li>Focus on topics where your score is below 75%</li>
            <li>Review class notes and textbook chapters related to your weak areas</li>
            <li>Form study groups with classmates who excel in your weak areas</li>
            <li>Utilize online resources like Khan Academy, Coursera, or EdX for additional learning</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentWheelAssessmentChart;