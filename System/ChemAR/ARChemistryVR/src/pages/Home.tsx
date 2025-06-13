import { Button, Container, Box, Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import { IonApp, IonContent, IonPage, IonIcon } from "@ionic/react";
import { arrowForward, flask, school, colorPalette } from 'ionicons/icons';
import { useState, useEffect } from "react";

const Home: React.FC = () => {
  const history = useHistory();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Add animation when component mounts
    setLoaded(true);
  }, []);

  return (
    <IonApp>
      <IonPage>
        <IonContent>
          <Container maxWidth={false} disableGutters>
            <Box
              sx={{
                backgroundImage: "url('/img/landing.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0, 0, 30, 0.6)",
                  zIndex: 1
                }
              }}
            >
              {/* Floating elements for visual interest */}
              <Box
                sx={{
                  position: "absolute",
                  top: "15%",
                  left: "10%",
                  zIndex: 2,
                  opacity: 0.7,
                  transform: `translateY(${loaded ? '0' : '30px'})`,
                  transition: "all 1.2s ease-out",
                }}
              >
                <IonIcon
                  icon={flask}
                  style={{ 
                    fontSize: "80px", 
                    color: "#61dafb"
                  }}
                />
              </Box>
              
              <Box
                sx={{
                  position: "absolute",
                  bottom: "20%",
                  right: "15%",
                  zIndex: 2,
                  opacity: 0.6,
                  transform: `translateY(${loaded ? '0' : '30px'})`,
                  transition: "all 1.5s ease-out",
                }}
              >
                <IonIcon
                  icon={colorPalette}
                  style={{ 
                    fontSize: "70px", 
                    color: "#bb86fc"
                  }}
                />
              </Box>

              {/* Main content */}
              <Box
                sx={{
                  padding: { xs: "30px", md: "50px" },
                  borderRadius: "16px",
                  color: "white",
                  textAlign: "center",
                  maxWidth: "700px",
                  backgroundColor: "rgba(30, 30, 60, 0.75)",
                  backdropFilter: "blur(10px)",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  zIndex: 2,
                  transform: `scale(${loaded ? '1' : '0.95'}) translateY(${loaded ? '0' : '20px'})`,
                  opacity: loaded ? 1 : 0,
                  transition: "all 0.8s ease-out"
                }}
              >
                <Box 
                  sx={{ 
                    marginBottom: "30px",
                    display: "flex",
                    justifyContent: "center" 
                  }}
                >
                  <IonIcon
                    icon={school}
                    style={{ 
                      fontSize: "80px", 
                      color: "#61dafb"
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h2" 
                  component="h1" 
                  gutterBottom
                  sx={{
                    fontWeight: "700",
                    background: "linear-gradient(45deg, #61dafb 30%, #bb86fc 90%)",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    letterSpacing: "0.02em",
                    marginBottom: "20px",
                    fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" }
                  }}
                >
                  Welcome to ChemAR
                </Typography>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    marginBottom: "40px",
                    opacity: 0.9,
                    maxWidth: "600px",
                    margin: "0 auto 40px auto",
                    lineHeight: 1.6
                  }}
                >
                  Discover chemistry in augmented reality. Visualize molecules, conduct virtual experiments, and learn interactively.
                </Typography>
                
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => history.push("/dashboard")}
                    sx={{
                      padding: "12px 30px",
                      fontSize: "1.1rem",
                      textTransform: "none",
                      borderRadius: "50px",
                      background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      boxShadow: "0 3px 15px rgba(33, 203, 243, 0.3)",
                      transition: "all 0.3s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 20px rgba(33, 203, 243, 0.4)",
                      }
                    }}
                    endIcon={<IonIcon icon={arrowForward} />}
                  >
                    Get Started
                  </Button>
                  
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    marginTop: "40px",
                    opacity: 0.7 
                  }}
                >
                  Experience chemistry like never before
                </Typography>
              </Box>
            </Box>
          </Container>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default Home;