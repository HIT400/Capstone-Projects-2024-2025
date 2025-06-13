import React, { useState } from "react";
import {
  IonContent,
  IonPage,
  IonApp,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonLabel,
  IonIcon,
  IonAlert,
  IonHeader,
} from "@ionic/react";
import { arrowBack, reorderTwo } from "ionicons/icons";
import "./Game.css";
import { useHistory } from "react-router";

// List of elements and their categories
const elements = [
  { name: "Hydrogen", category: "Non-metals" },
  { name: "Oxygen", category: "Non-metals" },
  { name: "Sodium", category: "Metals" },
  { name: "Neon", category: "Noble Gases" },
  { name: "Copper", category: "Metals" },
  { name: "Chlorine", category: "Halogens" },
];

const categories = [
  { name: "Metals", elements: [] },
  { name: "Non-metals", elements: [] },
  { name: "Noble Gases", elements: [] },
  { name: "Halogens", elements: [] },
];

const Game: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [elementsState, setElementsState] = useState(elements);
  const [categoriesState, setCategoriesState] = useState(categories);
  const [showAlert, setShowAlert] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    const sourceCategory : any = categoriesState[source.droppableId];
    const destCategory : any = categoriesState[destination.droppableId];
    const draggedElement : any = elementsState[source.index];

    // Remove the element from the source category
    sourceCategory.elements = sourceCategory.elements.filter(
      (element : any) => element.name !== draggedElement.name
    );

    // Add the element to the destination category
    destCategory.elements.push(draggedElement);

    // Update state
    setCategoriesState([...categoriesState]);
    setElementsState([...elementsState]);

    // Check if the element was placed correctly
    if (draggedElement.category === destCategory.name) {
      setFeedbackMessage("Correct!");
    } else {
      setFeedbackMessage(
        `Wrong! The correct category is ${draggedElement.category}.`
      );
    }
    setShowAlert(true);
  };

  const history = useHistory();

  // Navigate back to the previous page
  const handleBackClick = () => {
    history.goBack();
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
            <IonTitle>Games</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
          <div className="container text-center p-4">
            <div className="row row-cols-1 row-cols-md-2 g-4">
              <div className="col">
                <a
                  href="/dashboard/category-wheel"
                  className="text-decoration-none"
                >
                  <div className="card shadow-sm custom-card border-primary">
                    <div className="card-body text-center">
                      <i className="bi bi-grid fs-1 text-primary"></i>
                      <h5 className="card-title mt-2 text-dark">
                        Category Wheel
                      </h5>
                    </div>
                  </div>
                </a>
              </div>

              <div className="col">
                <a href="/dashboard/quiz" className="text-decoration-none">
                  <div className="card shadow-sm custom-card border-warning">
                    <div className="card-body text-center">
                      <i className="bi bi-question-circle fs-1 text-warning"></i>
                      <h5 className="card-title mt-2 text-dark">Quiz</h5>
                    </div>
                  </div>
                </a>
              </div>

              <div className="col">
                <a href="/dashboard/dnd-game" className="text-decoration-none">
                  <div className="card shadow-sm custom-card border-warning">
                    <div className="card-body text-center">
                      <i className="bi bi-hand-index fs-1 text-warning"></i>{" "}
                      {/* Hand icon added */}
                      <h5 className="card-title mt-2 text-dark">DND Gamer</h5>
                      <p className="card-text text-muted mt-2">
                        Experience the thrill of drag-and-drop gameplay!
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default Game;
