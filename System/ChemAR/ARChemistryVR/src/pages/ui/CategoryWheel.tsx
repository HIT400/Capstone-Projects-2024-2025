import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonPage,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonLabel,
  IonAlert,
  IonCheckbox,
} from "@ionic/react";
import { Wheel } from "react-custom-roulette";
import { arrowForward, arrowBack, checkmarkCircle } from "ionicons/icons"; // Added checkmarkCircle icon
import { useHistory } from "react-router-dom"; // For navigation
import "./CategoryWheel.css";

// Category and corresponding questions, options, and answers
const categoryQuestions: any = {
  "Noble Gases": {
    question: "Which of the following is a noble gas?",
    options: ["Oxygen", "Neon", "Carbon", "Nitrogen"],
    answer: "Neon",
  },
  Halogens: {
    question: "Which of the following is a halogen?",
    options: ["Fluorine", "Helium", "Iron", "Zinc"],
    answer: "Fluorine",
  },
  "Transition Metals": {
    question: "Which of the following is a transition metal?",
    options: ["Copper", "Hydrogen", "Carbon", "Oxygen"],
    answer: "Copper",
  },
  "Lightest Elements": {
    question: "Which of the following is the lightest element?",
    options: ["Oxygen", "Helium", "Hydrogen", "Nitrogen"],
    answer: "Hydrogen",
  },
  "Reactive Metals": {
    question: "Which of the following is a highly reactive metal?",
    options: ["Sodium", "Lead", "Gold", "Iron"],
    answer: "Sodium",
  },
};

const CategoryWheel: React.FC = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [question, setQuestion] = useState<string>(""); // Store the question
  const [options, setOptions] = useState<string[]>([]); // Store the multiple-choice options
  const [correctAnswer, setCorrectAnswer] = useState<string>(""); // Store the correct answer
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]); // User's selected answers
  const [answerFeedback, setAnswerFeedback] = useState<string>(""); // Feedback for correct/incorrect answer
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false); // New state to track if answer is submitted

  // Generate random dull colors for each option
  const data = [
    { option: "Noble Gases", style: { backgroundColor: "RoyalBlue" } },
    { option: "Halogens", style: { backgroundColor: "#FFD700" } }, // Gold
    { option: "Transition Metals", style: { backgroundColor: "#FF5733" } }, // Bright Orange-Red
    { option: "Lightest Elements", style: { backgroundColor: "#00BFFF" } }, // Deep Sky Blue
    { option: "Reactive Metals", style: { backgroundColor: "#32CD32" } } // Lime Green
  ];

  const handleSpinClick = () => {
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    // Reset answer state
    setSelectedAnswers([]);
    setAnswerFeedback("");
    setIsAnswerSubmitted(false);
  };

  const handleSpinEnd = () => {
    const selectedCategory = data[prizeNumber].option;
    setQuestion(
      categoryQuestions[selectedCategory]?.question || "No question available."
    );
    setOptions(categoryQuestions[selectedCategory]?.options || []);
    setCorrectAnswer(categoryQuestions[selectedCategory]?.answer || "");
    setShowModal(true); // Show the modal with the question
    setMustSpin(false); // Stop the spinning
    // Reset answer state
    setSelectedAnswers([]);
    setAnswerFeedback("");
    setIsAnswerSubmitted(false);
  };

  const handleAnswerChange = (option: string) => {
    // Only allow changing answer if not submitted yet
    if (!isAnswerSubmitted) {
      // If the option is already selected, remove it (uncheck)
      if (selectedAnswers.includes(option)) {
        setSelectedAnswers((prevSelected) =>
          prevSelected.filter((answer) => answer !== option)
        );
      } else {
        // Otherwise, add the new option (check it)
        setSelectedAnswers([option]); // Prevent selecting multiple options
      }
    }
  };

  const handleSubmitAnswer = () => {
    // Retrieve the current strengths from localStorage
    let storedData: number[] = JSON.parse(
      localStorage.getItem("studentChemistryStrengths") || "[]"
    );

    // If there is no data in localStorage, use default values
    if (storedData.length === 0) {
      storedData = [1, 1, 1, 1]; // Default values (this can be changed to your own)
    }
    // Update the strength based on the selected category's index
    const updatedStrengths = [...storedData];
    const selectedCategoryIndex = prizeNumber -1; // Use the prizeNumber (index from the wheel)
    let newStrength = 0;
    
    // Calculate the new strength for the selected category (using an example logic for averaging)
    if (selectedAnswers.includes(correctAnswer)) {
      setAnswerFeedback("Correct!");
      newStrength = (storedData[selectedCategoryIndex] + 100) / 2; // Example: Assuming each question boosts by 100
    } else {
      newStrength = (storedData[selectedCategoryIndex] + 0) / 2; // Example: Assuming each question boosts by 100
      setAnswerFeedback(`Wrong! The correct answer is ${correctAnswer}.`);
    }
    
    updatedStrengths[selectedCategoryIndex] = newStrength; // Update the strength for the selected category
    
    // Store the updated strengths back in localStorage
    localStorage.setItem(
      "studentChemistryStrengths",
      JSON.stringify(updatedStrengths)
    );
    
    // Set answer as submitted to show the green tick
    setIsAnswerSubmitted(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset states when closing the modal
    setSelectedAnswers([]);
    setAnswerFeedback("");
    setIsAnswerSubmitted(false);
  };

  const history = useHistory();

  // Navigate back to the previous page
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
          <IonTitle>Category Wheel</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="spin-wheel-content">
        <div className="wheel-container">
          <Wheel
            mustStartSpinning={mustSpin}
            prizeNumber={prizeNumber}
            data={data}
            onStopSpinning={handleSpinEnd} // Trigger handleSpinEnd when the wheel stops spinning
            backgroundColors={data.map((item) => item.style.backgroundColor)}
          />
          <IonButton onClick={handleSpinClick} color="primary" expand="full">
            <IonIcon icon={arrowForward} slot="start" />
            Spin the Wheel
          </IonButton>
        </div>

        {/* Modal for showing question */}
        {showModal && (
          <div className="modal text-dark show d-block" tabIndex={-1}>
            <div className="modal-dialog  modal-fullscreen">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chemistry Question</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body ">
                  <div className="card p-5">
                    <h4>{question}</h4>
                    {options.map((option, index) => (
                      <div key={index} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
                        <IonCheckbox
                          slot="start"
                          value={option}
                          onIonChange={() => handleAnswerChange(option)}
                          checked={selectedAnswers.includes(option)}
                          style={{
                            marginBottom: "10px",
                            padding: "8px",
                            borderRadius: "5px",
                            backgroundColor: "#fff",
                            borderColor: "#ccc",
                          }}
                          name="answerGroup"
                          disabled={isAnswerSubmitted} // Disable checkbox after submission
                        />
                        <IonLabel>{option}</IonLabel>
                        
                        {/* Green tick for the correct answer after submission */}
                        {isAnswerSubmitted && option === correctAnswer && (
                          <IonIcon 
                            icon={checkmarkCircle} 
                            style={{
                              color: "green", 
                              fontSize: "24px", 
                              marginLeft: "10px"
                            }}
                          />
                        )}
                      </div>
                    ))}
                    <IonButton
                      onClick={handleSubmitAnswer}
                      expand="full"
                      color="primary"
                      disabled={selectedAnswers.length === 0 || isAnswerSubmitted} // Disable button if no selection or already submitted
                    >
                      Submit Answer
                    </IonButton>
                    {answerFeedback && (
                      <div
                        style={{
                          marginTop: "10px",
                          fontWeight: "bold",
                          color:
                            answerFeedback === "Correct!" ? "green" : "red",
                        }}
                      >
                        {answerFeedback}
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <IonButton
                    onClick={handleCloseModal}
                    color="secondary"
                  >
                    Close
                  </IonButton>
                </div>
              </div>
            </div>
          </div>
        )}

      </IonContent>
    </IonPage>
  );
};

export default CategoryWheel;