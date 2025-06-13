import { Redirect, Route, useHistory } from "react-router-dom";
import {
  IonAlert,
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonBackButton,
  IonButtons,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { arrowBack, cube, flask, scan, eye, moon, sunny } from "ionicons/icons";

/* Ionic Core CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Dark Mode */
import "@ionic/react/css/palettes/dark.system.css";

/* Pages */
import AtomicModel from "./components/AtomicModel";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CategoryWheel from "./pages/ui/CategoryWheel";
import ArScan from "./pages/ui/ArScan";
import Theory from "./pages/ui/Theory";
import Quiz from "./pages/ui/Quiz";
import Game from "./pages/ui/Game";
import DndGame from "./pages/ui/DndGame";
import ARDEv from "./pages/ui/ARDEv";
import Login from "./pages/ui/Login";
import StudentProgress from "./pages/ui/StudentProgress";
import ManageContent from "./pages/ui/ManageContent";
import ManageContentQuiz from "./pages/ui/ManageContentQuiz";
import ManageContentDND from "./pages/ui/ManageContentDND";

setupIonicReact();

const RedirectToExternal: React.FC = () => {
  const history = useHistory();

  const navigateToAR = (type: "compound" | "element") => {
    const baseURL = "https://ar.encrytedtechnologies.com/";
    let targetURL = "";

    switch (type) {
      case "compound":
        targetURL = `${baseURL}hello-cube.html`;
        break;
      case "element":
        targetURL = `${baseURL}custom-patterns.html`;
        break;
      default:
        targetURL = baseURL;
    }

    window.location.href = targetURL;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>AR Chemistry Experience</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div
          style={{
            background:
              "linear-gradient(135deg, #051937, #004d7a, #008793, #00bf72, #a8eb12)",
            borderRadius: "15px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            color: "white",
          }}
        >
          <h2 style={{ fontWeight: "bold" }}>Augmented Reality Chemistry</h2>
          <p>
            Explore chemical elements and compounds in immersive 3D space using
            our AR technology. Point your camera at the markers to see chemistry
            come alive!
          </p>
        </div>

        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard
                className="ion-margin-bottom"
                style={{
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => navigateToAR("element")}
              >
                <div
                  style={{
                    height: "130px",
                    background: "linear-gradient(135deg, #3a7bd5, #00d2ff)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IonIcon
                    icon={sunny}
                    style={{ fontSize: "70px", color: "white" }}
                  />
                </div>
                <IonCardHeader>
                  <IonCardTitle>Atomic Elements</IonCardTitle>
                  <IonCardSubtitle>
                    Visualize electron configurations
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  See the electron shells and configurations of various
                  elements. Learn about atomic structure through interactive 3D
                  models.
                </IonCardContent>
                <div className="ion-padding">
                  <IonButton expand="block" fill="clear">
                    Launch AR Experience
                  </IonButton>
                </div>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="4">
              <IonCard
                className="ion-margin-bottom"
                style={{
                  borderRadius: "15px",
                  overflow: "hidden",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  transition: "transform 0.3s",
                  cursor: "pointer",
                }}
                onClick={() => navigateToAR("compound")}
              >
                <div
                  style={{
                    height: "130px",
                    background: "linear-gradient(135deg, #8E2DE2, #4A00E0)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IonIcon
                    icon={flask}
                    style={{ fontSize: "70px", color: "white" }}
                  />
                </div>
                <IonCardHeader>
                  <IonCardTitle>Chemical Compounds</IonCardTitle>
                  <IonCardSubtitle>Explore chemical bonding</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  Discover how elements combine to form compounds. See molecular
                  structures and learn about chemical bonding patterns.
                </IonCardContent>
                <div className="ion-padding">
                  <IonButton expand="block" fill="clear">
                    Launch AR Experience
                  </IonButton>
                </div>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonCard
          style={{
            borderRadius: "15px",
            overflow: "hidden",
            marginTop: "20px",
            background: "linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)",
          }}
        >
          <IonCardContent className="ion-padding">
            <h2 style={{ color: "white", fontWeight: "bold" }}>
              How to use AR Chemistry
            </h2>
            <ol style={{ color: "white", paddingLeft: "20px" }}>
              <li>Select one of the AR experiences above</li>
              <li>Allow camera permissions when prompted</li>
              <li>Point your camera at the provided marker patterns</li>
              <li>Watch as chemical models appear in augmented reality</li>
              <li>Interact with models to learn about chemistry concepts</li>
            </ol>
            <IonButton
              fill="solid"
              color="light"
              expand="block"
              onClick={() => history.goBack()}
              style={{ marginTop: "10px" }}
            >
              <IonIcon icon={arrowBack} slot="start" />
              Back to Dashboard
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

const App: React.FC = () => (
  <IonReactRouter>
    <IonRouterOutlet>
      <Route exact path="/home">
        <Home />
      </Route>
      <Route path="/dashboard" exact>
        <Dashboard />
      </Route>
      <Route exact path="/theory">
        <Theory />
      </Route>
      <Route exact path="/ar-scan">
        <ArScan />
      </Route>
      <Route exact path="/category-wheel">
        <CategoryWheel />
      </Route>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>

      <Route path="/dashboard/category-wheel" component={CategoryWheel} exact />
      <Route path="/dashboard/quiz" component={Quiz} exact />
      <Route path="/dashboard/theory" component={Theory} exact />
      <Route path="/dashboard/dnd-game" component={DndGame} exact />
      <Route path="/dashboard/manage-content" component={ManageContent} exact />
      <Route
        path="/dashboard/manage-content/dnd-questions"
        component={ManageContentDND}
        exact
      />
      <Route
        path="/dashboard/manage-content/quiz-questions"
        component={ManageContentQuiz}
        exact
      />
      <Route
        path="/dashboard/student-progress"
        component={StudentProgress}
        exact
      />
      <Route path="/dashboard/assessments" component={DndGame} exact />
      <Route path="/dashboard/my-progress" component={StudentProgress} exact />
      <Route path="/dashboard/game" component={Game} exact />
      <Route exact path="/dashboard/atom">
        <AtomicModel />
      </Route>
      <Route path="/dashboard/ar-scan" component={RedirectToExternal} exact />
      <Route path="/login" component={Login} exact />
    </IonRouterOutlet>
  </IonReactRouter>
);

export default App;
