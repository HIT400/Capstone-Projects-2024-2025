import React, { useEffect, useState } from "react";
import {
  IonApp,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonFooter,
  IonToast,
  IonList,
  IonItem,
  IonLabel,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonItemDivider,
  IonAlert,
} from "@ionic/react";
import {
  logOutOutline,
  menuOutline,
  addOutline,
  createOutline,
  trashOutline,
  closeOutline,
  saveOutline,
  arrowBack,
} from "ionicons/icons";
import { useHistory } from "react-router";
import { theQuizQuesions } from "../../components/quizQuesions";

interface UserData {
  type: string;
  name?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

const ManageContentQuiz: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<QuizQuestion>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<any[]>([]);

  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions");
    if (storedQuestions) {
      try {
        setQuizQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error(
          "Failed to parse quiz questions from localStorage:",
          error
        );
        setQuizQuestions(theQuizQuesions);
        localStorage.setItem("quizQuestions", JSON.stringify(theQuizQuesions));
      }
    } else {
      setQuizQuestions(theQuizQuesions);
      localStorage.setItem("quizQuestions", JSON.stringify(theQuizQuesions));
    }

    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    } else {
      history.push("/login");
    }
  }, [history, "quizQuestions"]); // Include 'quizQuestions' in dependency array (though it won't change)

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowToast(true);
    setTimeout(() => {
      history.push("/login");
    }, 1500);
  };

  const openAddModal = () => {
    setNewQuestion({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const saveNewQuestion = () => {
    if (
      newQuestion.question.trim() === "" ||
      newQuestion.options.some((option) => option.trim() === "") ||
      newQuestion.correctAnswer.trim() === "" ||
      !newQuestion.options.includes(newQuestion.correctAnswer)
    ) {
      setAlertMessage(
        "Please fill in all fields and ensure the correct answer is one of the options."
      );
      setAlertButtons([{ text: "Okay" }]);
      setShowAlert(true);
      return;
    }
    setQuizQuestions([...quizQuestions, newQuestion]);
    closeAddModal();
  };

  const openEditModal = (index: number) => {
    setEditingQuestionIndex(index);
    setNewQuestion({ ...quizQuestions[index] });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingQuestionIndex(null);
    setIsEditModalOpen(false);
  };

  const handleInputChange = (event: any, optionIndex?: number) => {
    const { name, value } = event.target;
    if (name === "question" || name === "correctAnswer") {
      setNewQuestion((prev) => ({ ...prev, [name]: value }));
    } else if (name.startsWith("option") && optionIndex !== undefined) {
      const newOptions = [...newQuestion.options];
      newOptions[optionIndex] = value;
      setNewQuestion((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const saveEditedQuestion = () => {
    if (editingQuestionIndex === null) return;
    if (
      newQuestion.question.trim() === "" ||
      newQuestion.options.some((option) => option.trim() === "") ||
      newQuestion.correctAnswer.trim() === "" ||
      !newQuestion.options.includes(newQuestion.correctAnswer)
    ) {
      setAlertMessage(
        "Please fill in all fields and ensure the correct answer is one of the options."
      );
      setAlertButtons([{ text: "Okay" }]);
      setShowAlert(true);
      return;
    }
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[editingQuestionIndex] = { ...newQuestion };
    setQuizQuestions(updatedQuestions);
    closeEditModal();
  };

  const handleDeleteConfirmation = (index: number) => {
    setAlertMessage("Are you sure you want to delete this question?");
    setAlertButtons([
      { text: "Cancel", role: "cancel" },
      {
        text: "Delete",
        handler: () => {
          const updatedQuestions = quizQuestions.filter((_, i) => i !== index);
          setQuizQuestions(updatedQuestions);
        },
      },
    ]);
    setShowAlert(true);
  };

  const handleBackClick = () => {
    window.history.back();
  };
  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonButton onClick={handleBackClick}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            </IonButtons>
            <IonTitle className="ion-text-center">
              Chemistry {user?.type === "teacher" ? "Teacher" : "Student"}{" "}
              Manage Quiz Questions
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout}>
                <IonIcon icon={logOutOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <h2>Manage Quiz Questions</h2>

          <IonList>
            {quizQuestions.map((question, index) => (
              <IonItem key={index}>
                <IonLabel>
                  <h3>{question.question}</h3>
                  <p>Correct Answer: {question.correctAnswer}</p>
                  <ul>
                    {question.options.map((option, i) => (
                      <li key={i}>{option}</li>
                    ))}
                  </ul>
                </IonLabel>
                <IonButtons slot="end">
                  <IonButton fill="clear" onClick={() => openEditModal(index)}>
                    <IonIcon icon={createOutline} color="primary" />
                  </IonButton>
                  <IonButton
                    fill="clear"
                    onClick={() => handleDeleteConfirmation(index)}
                  >
                    <IonIcon icon={trashOutline} color="danger" />
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))}
          </IonList>

          <IonFab
            vertical="bottom"
            horizontal="end"
            slot="fixed"
            onClick={openAddModal}
          >
            <IonFabButton color="primary">
              <IonIcon icon={addOutline} />
            </IonFabButton>
          </IonFab>

          {/* Add New Question Modal */}
          <IonModal isOpen={isAddModalOpen} onDidDismiss={closeAddModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Add New Question</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeAddModal}>
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonItem>
                <IonLabel position="floating">Question</IonLabel>
                <IonInput
                  name="question"
                  value={newQuestion.question}
                  onIonChange={(e) => handleInputChange(e)}
                />
              </IonItem>
              <IonItemDivider>Options</IonItemDivider>
              {newQuestion.options.map((option, index) => (
                <IonItem key={index}>
                  <IonLabel position="floating">Option {index + 1}</IonLabel>
                  <IonInput
                    name={`option${index + 1}`}
                    value={option}
                    onIonChange={(e) => handleInputChange(e, index)}
                  />
                </IonItem>
              ))}
              <IonItem>
                <IonLabel position="floating">Correct Answer</IonLabel>
                <IonInput
                  name="correctAnswer"
                  value={newQuestion.correctAnswer}
                  onIonChange={(e) => handleInputChange(e)}
                />
              </IonItem>
              <IonButton
                expand="full"
                onClick={saveNewQuestion}
                className="ion-margin-top"
              >
                <IonIcon icon={saveOutline} slot="start" />
                Save Question
              </IonButton>
            </IonContent>
          </IonModal>

          {/* Edit Question Modal */}
          <IonModal isOpen={isEditModalOpen} onDidDismiss={closeEditModal}>
            <IonHeader>
              <IonToolbar>
                <IonTitle>Edit Question</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeEditModal}>
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              {editingQuestionIndex !== null && (
                <>
                  <IonItem>
                    <IonLabel position="floating">Question</IonLabel>
                    <IonInput
                      name="question"
                      value={newQuestion.question}
                      onIonChange={(e) => handleInputChange(e)}
                    />
                  </IonItem>
                  <IonItemDivider>Options</IonItemDivider>
                  {newQuestion.options.map((option, index) => (
                    <IonItem key={index}>
                      <IonLabel position="floating">
                        Option {index + 1}
                      </IonLabel>
                      <IonInput
                        name={`option${index + 1}`}
                        value={option}
                        onIonChange={(e) => handleInputChange(e, index)}
                      />
                    </IonItem>
                  ))}
                  <IonItem>
                    <IonLabel position="floating">Correct Answer</IonLabel>
                    <IonInput
                      name="correctAnswer"
                      value={newQuestion.correctAnswer}
                      onIonChange={(e) => handleInputChange(e)}
                    />
                  </IonItem>
                  <IonButton
                    expand="full"
                    onClick={saveEditedQuestion}
                    className="ion-margin-top"
                  >
                    <IonIcon icon={saveOutline} slot="start" />
                    Save Changes
                  </IonButton>
                </>
              )}
            </IonContent>
          </IonModal>

          <IonAlert
            isOpen={showAlert}
            message={alertMessage}
            buttons={alertButtons}
            onDidDismiss={() => setShowAlert(false)}
          />
        </IonContent>

        <IonFooter>
          <IonToolbar color="primary" className="ion-text-center text-white">
            <small>ARChemistryVR © {new Date().getFullYear()}</small>
          </IonToolbar>
        </IonFooter>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Successfully logged out"
          duration={1500}
          position="top"
          color="success"
        />
      </IonPage>
    </IonApp>
  );
};

export default ManageContentQuiz;
