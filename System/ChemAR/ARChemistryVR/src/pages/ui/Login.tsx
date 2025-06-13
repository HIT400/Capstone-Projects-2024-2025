import {
  IonApp,
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonIcon,
  IonLoading,
  IonImg,
} from "@ionic/react";
import { logoIonic, logIn, lockClosed, person } from "ionicons/icons";
import { useState } from "react";
import { useHistory } from "react-router-dom";

const Login: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Please enter both username and password");
      setShowToast(true);
      return;
    }

    setLoading(true);
    console.log(username , password)
    // Simulate API call with timeout
    setTimeout(() => {
      if (username === "teacher" || username === "student" && password === "password") {
        const user = {
          username: username,   // Username
          name: 'Ashley',       // First name
          type : username
        };
        localStorage.setItem("user", JSON.stringify(user));
        
        localStorage.setItem("authToken", "your-auth-token");

        history.push("/dashboard");
      } else {
        setErrorMessage("Invalid username or password");
        setShowToast(true);
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <IonApp>
      <IonPage>
        <IonContent className="ion-padding">
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "var(--ion-color-light)",
            }}
          >
            <IonCard
              style={{
                width: "90%",
                maxWidth: "400px",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <IonCardHeader className="ion-text-center">
                <div style={{ padding: "20px 0" }}>
                  <IonImg
                    src="/img/logo.png" // Replace with the actual path to your image
                    alt="Logo"
                    onDoubleClick={()=>localStorage.clear()}
                    style={{
                      fontSize: "64px",
                      color: "var(--ion-color-primary)",
                    }}
                  />
                </div>
                <IonCardTitle className="ion-padding-bottom">
                  Welcome Back
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <IonItem
                  lines="full"
                  style={{ marginBottom: "16px", borderRadius: "8px" }}
                >
                  <IonIcon slot="start" icon={person} color="medium" />
                  <IonInput
                    type="text"
                    value={username}
                    placeholder="Username"
                    onIonChange={(e) => setUsername(e.detail.value!)}
                    clearInput
                  />
                </IonItem>

                <IonItem
                  lines="full"
                  style={{ marginBottom: "24px", borderRadius: "8px" }}
                >
                  <IonIcon slot="start" icon={lockClosed} color="medium" />
                  <IonInput
                    type="password"
                    value={password}
                    placeholder="Password"
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    clearInput
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  onClick={handleLogin}
                  style={{
                    marginTop: "16px",
                    height: "48px",
                    fontSize: "16px",
                    borderRadius: "8px",
                  }}
                >
                  <IonIcon slot="start" icon={logIn} />
                  Log In
                </IonButton>

              </IonCardContent>
            </IonCard>
          </div>

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={errorMessage}
            duration={2000}
            color="danger"
            position="top"
          />

          <IonLoading isOpen={loading} message="Logging in..." />
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default Login;
