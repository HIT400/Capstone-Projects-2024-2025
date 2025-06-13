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
import { theDndQuestions } from "../../components/dndQuestions";

interface UserData {
  type: string;
  name?: string;
}

interface Symbol {
  id: string;
  symbol: string;
  name: string;
}

interface DNDQuestion {
  name: string;
  symbols: Symbol[];
  correctFormula: string;
}

const ManageContentDND: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();
  const [dndQuestions, setDNDQuestions] = useState<DNDQuestion[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState<DNDQuestion>({
    name: "",
    symbols: [],
    correctFormula: "",
  });
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<
    number | null
  >(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<any[]>([]);
  const localStorageKey = "dndQuestions";

  useEffect(() => {
    const storedQuestions = localStorage.getItem(localStorageKey);
    if (storedQuestions) {
      try {
        setDNDQuestions(JSON.parse(storedQuestions));
      } catch (error) {
        console.error(
          "Failed to parse DND questions from localStorage:",
          error
        );
        setDNDQuestions(theDndQuestions);
        localStorage.setItem(
          localStorageKey,
          JSON.stringify(theDndQuestions)
        );
      }
    } else {
      setDNDQuestions(theDndQuestions);
      localStorage.setItem(
        localStorageKey,
        JSON.stringify(theDndQuestions)
      );
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
  }, [history, localStorageKey]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowToast(true);
    setTimeout(() => {
      history.push("/login");
    }, 1500);
  };

  const openAddModal = () => {
    setNewQuestion({ name: "", symbols: [], correctFormula: "" });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const saveNewQuestion = () => {
    if (
      newQuestion.name.trim() === "" ||
      newQuestion.correctFormula.trim() === "" ||
      newQuestion.symbols.length === 0
    ) {
      setAlertMessage(
        "Please fill in the name, correct formula, and add at least one symbol."
      );
      setAlertButtons([{ text: "Okay" }]);
      setShowAlert(true);
      return;
    }
    setDNDQuestions([...dndQuestions, newQuestion]);
    closeAddModal();
  };

  const openEditModal = (index: number) => {
    setEditingQuestionIndex(index);
    setNewQuestion({ ...dndQuestions[index] });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingQuestionIndex(null);
    setIsEditModalOpen(false);
  };

  const handleInputChange = (event: any) => {
    const { name, value } = event.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleSymbolChange = (index: number, event: any) => {
    const { name, value } = event.target;
    const updatedSymbols = newQuestion.symbols.map((sym, i) =>
      i === index ? { ...sym, [name]: value } : sym
    );
    setNewQuestion((prev) => ({ ...prev, symbols: updatedSymbols }));
  };

  const addSymbol = () => {
    setNewQuestion((prev) => ({
      ...prev,
      symbols: [...prev.symbols, { id: "", symbol: "", name: "" }],
    }));
  };

  const removeSymbol = (index: number) => {
    const updatedSymbols = newQuestion.symbols.filter((_, i) => i !== index);
    setNewQuestion((prev) => ({ ...prev, symbols: updatedSymbols }));
  };

  const saveEditedQuestion = () => {
    if (editingQuestionIndex === null) return;
    if (
      newQuestion.name.trim() === "" ||
      newQuestion.correctFormula.trim() === "" ||
      newQuestion.symbols.length === 0
    ) {
      setAlertMessage(
        "Please fill in the name, correct formula, and add at least one symbol."
      );
      setAlertButtons([{ text: "Okay" }]);
      setShowAlert(true);
      return;
    }
    const updatedQuestions = [...dndQuestions];
    updatedQuestions[editingQuestionIndex] = { ...newQuestion };
    setDNDQuestions(updatedQuestions);
    closeEditModal();
  };

  const handleDeleteConfirmation = (index: number) => {
    setAlertMessage(
      "Are you sure you want to delete this drag and drop question?"
    );
    setAlertButtons([
      { text: "Cancel", role: "cancel" },
      {
        text: "Delete",
        handler: () => {
          const updatedQuestions = dndQuestions.filter((_, i) => i !== index);
          setDNDQuestions(updatedQuestions);
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
              Manage Drag and Drop
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout}>
                <IonIcon icon={logOutOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <h2>Manage Drag and Drop Questions</h2>

          <IonList>
            {dndQuestions.map((question, index) => (
              <IonItem key={index}>
                <IonLabel>
                  <h3>{question.name}</h3>
                  <p>Correct Formula: {question.correctFormula}</p>
                  <p>
                    Symbols: {question.symbols.map((s) => s.symbol).join(", ")}
                  </p>
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
                <IonTitle>Add Drag and Drop Question</IonTitle>
                <IonButtons slot="end">
                  <IonButton onClick={closeAddModal}>
                    <IonIcon icon={closeOutline} />
                  </IonButton>
                </IonButtons>
              </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
              <IonItem>
                <IonLabel position="floating">Name</IonLabel>
                <IonInput
                  name="name"
                  value={newQuestion.name}
                  onIonChange={handleInputChange}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="floating">Correct Formula</IonLabel>
                <IonInput
                  name="correctFormula"
                  value={newQuestion.correctFormula}
                  onIonChange={handleInputChange}
                />
              </IonItem>
              <IonItemDivider>Symbols</IonItemDivider>
              {newQuestion.symbols.map((symbol, index) => (
                <div
                  key={index}
                  style={{
                    marginBottom: "10px",
                    border: "1px solid #eee",
                    padding: "10px",
                    borderRadius: "5px",
                  }}
                >
                  <IonItem>
                    <IonLabel position="floating">ID</IonLabel>
                    <IonInput
                      name="id"
                      value={symbol.id}
                      onIonChange={(e) => handleSymbolChange(index, e)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="floating">Symbol</IonLabel>
                    <IonInput
                      name="symbol"
                      value={symbol.symbol}
                      onIonChange={(e) => handleSymbolChange(index, e)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="floating">Name</IonLabel>
                    <IonInput
                      name="name"
                      value={symbol.name}
                      onIonChange={(e) => handleSymbolChange(index, e)}
                    />
                  </IonItem>
                  <IonButton
                    size="small"
                    color="danger"
                    onClick={() => removeSymbol(index)}
                  >
                    Remove Symbol
                  </IonButton>
                </div>
              ))}
              <IonButton
                expand="full"
                onClick={addSymbol}
                className="ion-margin-top"
              >
                Add Symbol
              </IonButton>
              <IonButton
                expand="full"
                onClick={saveNewQuestion}
                className="ion-margin-top"
                color="primary"
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
                <IonTitle>Edit Drag and Drop Question</IonTitle>
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
                    <IonLabel position="floating">Name</IonLabel>
                    <IonInput
                      name="name"
                      value={newQuestion.name}
                      onIonChange={handleInputChange}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="floating">Correct Formula</IonLabel>
                    <IonInput
                      name="correctFormula"
                      value={newQuestion.correctFormula}
                      onIonChange={handleInputChange}
                    />
                  </IonItem>
                  <IonItemDivider>Symbols</IonItemDivider>
                  {newQuestion.symbols.map((symbol, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "10px",
                        border: "1px solid #eee",
                        padding: "10px",
                        borderRadius: "5px",
                      }}
                    >
                      <IonItem>
                        <IonLabel position="floating">ID</IonLabel>
                        <IonInput
                          name="id"
                          value={symbol.id}
                          onIonChange={(e) => handleSymbolChange(index, e)}
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Symbol</IonLabel>
                        <IonInput
                          name="symbol"
                          value={symbol.symbol}
                          onIonChange={(e) => handleSymbolChange(index, e)}
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="floating">Name</IonLabel>
                        <IonInput
                          name="name"
                          value={symbol.name}
                          onIonChange={(e) => handleSymbolChange(index, e)}
                        />
                      </IonItem>
                      <IonButton
                        size="small"
                        color="danger"
                        onClick={() => removeSymbol(index)}
                      >
                        Remove Symbol
                      </IonButton>
                    </div>
                  ))}
                  <IonButton
                    expand="full"
                    onClick={addSymbol}
                    className="ion-margin-top"
                  >
                    Add Symbol
                  </IonButton>
                  <IonButton
                    expand="full"
                    onClick={saveEditedQuestion}
                    className="ion-margin-top"
                    color="primary"
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

export default ManageContentDND;
