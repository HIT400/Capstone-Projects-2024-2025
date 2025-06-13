import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from "@ionic/react";
import { arrowBack, checkmarkCircle, closeCircle } from "ionicons/icons";
import { useHistory } from "react-router";
import "bootstrap/dist/css/bootstrap.min.css";
import { theQuizQuesions } from "../../components/quizQuesions";

function Quiz() {
  const history = useHistory();
  const [quizQuesions,setQuizQuesions] = useState<any>(theQuizQuesions)

  useEffect(() => {
    const storedQuestions = localStorage.getItem('quizQuestions');
    if (storedQuestions) {
      try {
        setQuizQuesions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error("Failed to parse quiz questions from localStorage:", error);
        setQuizQuesions(theQuizQuesions);
        localStorage.setItem('quizQuestions', JSON.stringify(theQuizQuesions));
      }
    } else {
      setQuizQuesions(theQuizQuesions);
      localStorage.setItem('quizQuestions', JSON.stringify(theQuizQuesions));
    }
  }, []);

  const getRandomQuestions = () => {
    const shuffled = [...quizQuesions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionsToDisplay, setQuestionsToDisplay] = useState<any[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  useEffect(() => {
    const shuffledQuestions = getRandomQuestions();
    setQuestionsToDisplay(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setQuizFinished(false);
  }, []);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    setUserAnswers([...userAnswers, selectedAnswer || ""]);
    if (
      selectedAnswer === questionsToDisplay[currentQuestionIndex].correctAnswer
    ) {
      setScore(score + 1);
    }

    if (currentQuestionIndex + 1 < questionsToDisplay.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      const currentDate = new Date();
      const currentTestDate = currentDate.toISOString().split("T")[0]; // Format as YYYY-MM-DD

      // Check if testResults already exists in localStorage or use the default
      let studentTestAnalysis = JSON.parse(
        localStorage.getItem("studentTestAnalysis") || JSON.stringify([{ test: currentTestDate, correctAnswers: 0 },])
      );

      // Find the current test result based on the current date
      const testIndex = studentTestAnalysis.findIndex(
        (result: any) => result.test === currentTestDate
      );

      const newScore = (score / 5) * 100; // Calculate score for the new test
      if (testIndex === -1) {
        // If no matching test date is found, add a new test result with the current score
        studentTestAnalysis.push({
          test: currentTestDate,
          correctAnswers: newScore,
        }); // Add the new test
      } else {
        // If test date exists, update the score by adding half of the current score
        studentTestAnalysis[testIndex].correctAnswers = (studentTestAnalysis[testIndex].correctAnswers + newScore) / 2;
      }

      // Save the updated results to localStorage
      localStorage.setItem(
        "studentTestAnalysis",
        JSON.stringify(studentTestAnalysis)
      );
      const storedTestResults = localStorage.getItem("studentTestAnalysis");
      if (storedTestResults) {
      } else {
        localStorage.setItem("studentTestAnalysis", JSON.stringify([])); // Save default data to localStorage
      }

      setQuizFinished(true);
    }
  };

  const handleBackClick = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Quiz</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="d-flex justify-content-center align-items-center">
        <div className="container mt-4">
          {!quizFinished ? (
            <div className="card shadow-lg p-4">
              <h5 className="card-title text-center mb-4">
                <strong>Question {currentQuestionIndex + 1}</strong>
              </h5>
              <p className="text-center">
                {questionsToDisplay[currentQuestionIndex]?.question}
              </p>

              <div className="btn-group-vertical w-100">
                {questionsToDisplay[currentQuestionIndex]?.options.map(
                  (option: any, index: any) => (
                    <button
                      key={index}
                      className={`btn btn-lg w-100 mb-2 ${
                        selectedAnswer === option
                          ? "btn-primary"
                          : "btn-outline-primary"
                      }`}
                      onClick={() => handleAnswerSelection(option)}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>

              <IonButton
                expand="block"
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
                className="mt-3 btn btn-success w-100"
              >
                Next Question
              </IonButton>
            </div>
          ) : (
            <div className="card shadow-lg p-4">
              <h3 className="card-title text-center">Quiz Finished!</h3>
              <p className="text-center text-success h4">
                Your Score: {score} / 5
              </p>
              <div className="mt-3">
                <h5>Answers Summary</h5>
                {questionsToDisplay.map((question, index) => (
                  <div key={index} className="mb-3 border p-3 rounded">
                    <strong>
                      Q{index + 1}: {question.question}
                    </strong>
                    <p className="mb-1">
                      <IonIcon
                        icon={
                          userAnswers[index] === question.correctAnswer
                            ? checkmarkCircle
                            : closeCircle
                        }
                        className={
                          userAnswers[index] === question.correctAnswer
                            ? "text-success"
                            : "text-danger"
                        }
                      />
                      <strong className="ms-2">Your Answer:</strong>{" "}
                      {userAnswers[index] || "No answer"}
                    </p>
                    <p>
                      <strong>Correct Answer:</strong> {question.correctAnswer}
                    </p>
                  </div>
                ))}
              </div>
              <IonButton
                onClick={() => {
                  const shuffledQuestions = getRandomQuestions();
                  setQuestionsToDisplay(shuffledQuestions);
                  setCurrentQuestionIndex(0);
                  setScore(0);
                  setUserAnswers([]);
                  setSelectedAnswer(null);
                  setQuizFinished(false);
                }}
                className="mt-3 btn btn-primary w-100"
              >
                Retry Quiz
              </IonButton>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Quiz;
