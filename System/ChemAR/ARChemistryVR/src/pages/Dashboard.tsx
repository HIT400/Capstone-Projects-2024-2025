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
  IonToast
} from "@ionic/react";
import { logOutOutline, menuOutline, schoolOutline, personCircleOutline } from "ionicons/icons";
import { useHistory } from "react-router";
import "./Dashboard.css"; // We'll create this file for custom styles

interface UserData {
  type: string;
  name?: string;
}

const Dashboard: React.FC = () => {
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

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonButton>
                <IonIcon icon={menuOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle className="ion-text-center">
              Chemistry {user?.type === "teacher" ? "Teacher" : "Student"} Dashboard
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={handleLogout}>
                <IonIcon icon={logOutOutline} slot="icon-only" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Welcome message */}
          <div className="welcome-container">
            <div className="welcome-card">
              <div className="welcome-icon">
                <IonIcon 
                  icon={user?.type === "teacher" ? schoolOutline : personCircleOutline} 
                  color="primary"
                />
              </div>
              <div className="welcome-text">
                <h2>Welcome, {user?.name || (user?.type === "teacher" ? "Teacher" : "Student")}!</h2>
                <p>What would you like to explore today?</p>
              </div>
            </div>
          </div>

          {/* Different cards based on user type */}
          {user?.type === "teacher" ? (
            // Teacher dashboard cards
            <div className="dashboard-container">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {/* Manage Content Card */}
                <div className="col">
                  <a href="/dashboard/manage-content" className="text-decoration-none">
                    <div className="dashboard-card teacher-card">
                      <div className="card-icon">
                        <i className="bi bi-journal-text"></i>
                      </div>
                      <h3>Manage Content</h3>
                      <p>Create and update learning materials</p>
                    </div>
                  </a>
                </div>

                {/* Student Progress Card */}
                <div className="col">
                  <a href="/dashboard/student-progress" className="text-decoration-none">
                    <div className="dashboard-card teacher-card">
                      <div className="card-icon">
                        <i className="bi bi-graph-up"></i>
                      </div>
                      <h3>Student Progress</h3>
                      <p>Track and analyze student performance</p>
                    </div>
                  </a>
                </div>

              </div>
            </div>
          ) : (
            // Student dashboard cards
            <div className="dashboard-container">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {/* Theory Card */}
                <div className="col">
                  <a href="/dashboard/theory" className="text-decoration-none">
                    <div className="dashboard-card student-card">
                      <div className="card-icon theory-icon">
                        <i className="bi bi-book"></i>
                      </div>
                      <h3>Theory</h3>
                      <p>Learn the basics and build your knowledge</p>
                    </div>
                  </a>
                </div>

                {/* Game Card */}
                <div className="col">
                  <a href="/dashboard/game" className="text-decoration-none">
                    <div className="dashboard-card student-card">
                      <div className="card-icon game-icon">
                        <i className="bi bi-controller"></i>
                      </div>
                      <h3>Game</h3>
                      <p>Put your skills to the test and have fun!</p>
                    </div>
                  </a>
                </div>

                {/* AR Scan Card */}
                <div className="col">
                  <a href="/dashboard/ar-scan" className="text-decoration-none">
                    <div className="dashboard-card student-card">
                      <div className="card-icon ar-icon">
                        <i className="bi bi-upc-scan"></i>
                      </div>
                      <h3>AR Scan</h3>
                      <p>Explore the world through augmented reality!</p>
                    </div>
                  </a>
                </div>

                {/* My Progress Card */}
                <div className="col">
                  <a href="/dashboard/my-progress" className="text-decoration-none">
                    <div className="dashboard-card student-card">
                      <div className="card-icon progress-icon">
                        <i className="bi bi-bar-chart"></i>
                      </div>
                      <h3>My Progress</h3>
                      <p>Track your learning achievements</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}
        </IonContent>

        <IonFooter >
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

export default Dashboard;