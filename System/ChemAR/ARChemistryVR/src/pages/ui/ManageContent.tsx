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
} from "@ionic/react";
import {
  logOutOutline,
  menuOutline,
  schoolOutline,
  personCircleOutline,
  arrowBack,
} from "ionicons/icons";
import { useHistory } from "react-router";
import { IonRouterLink } from "@ionic/react"; // Import IonRouterLink for navigation

interface UserData {
  type: string;
  name?: string;
}

const ManageContent: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [showToast, setShowToast] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    } else {
      // Redirect to login if no user data
      history.push("/login");
    }
  }, [history]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setShowToast(true);
    // Redirect after toast shows
    setTimeout(() => {
      history.push("/login");
    }, 1500);
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
              Manage Content
            </IonTitle>{" "}
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <div className="dashboard-container">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {/* Quiz Questions Card */}
              <div className="col">
                <IonRouterLink
                  href="/dashboard/manage-content/quiz-questions"
                  className="text-decoration-none"
                >
                  <div className="dashboard-card quiz-card">
                    <div className="card-icon">
                      <i className="bi bi-question-circle"></i>
                    </div>
                    <h3>Quiz Questions</h3>
                    <p>Manage and create quiz questions</p>
                  </div>
                </IonRouterLink>
              </div>

              {/* DND Questions Card */}
              <div className="col">
                <IonRouterLink
                  href="/dashboard/manage-content/dnd-questions"
                  className="text-decoration-none"
                >
                  <div className="dashboard-card dnd-card">
                    <div className="card-icon">
                      <i className="bi bi-arrows-move"></i>
                    </div>
                    <h3>DND Questions</h3>
                    <p>Create drag and drop interactive questions</p>
                  </div>
                </IonRouterLink>
              </div>
            </div>
          </div>
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

export default ManageContent;
