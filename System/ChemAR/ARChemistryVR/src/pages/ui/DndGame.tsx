import React, { useState, useEffect } from "react";
import {
    IonApp,
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonChip,
    IonLabel,
    IonText,
    IonButton,
    IonButtons,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
} from "@ionic/react";
import { useHistory } from "react-router";
import { arrowBack, arrowUndo, arrowRedo, reload, trophy, school } from "ionicons/icons";
import { Modal, Button, ProgressBar } from "react-bootstrap"; // Importing Bootstrap Modal
import { theDndQuestions } from "../../components/dndQuestions";
import "./DndGame.css"; // We'll create this CSS file for additional styling

const DndGame: React.FC = () => {
    const historyy = useHistory();

    // Navigate back to the previous page
    const handleBackClick = () => {
        historyy.goBack();
    };

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userFormula, setUserFormula] = useState<string>("");
    const [history, setHistory] = useState<string[]>([]);
    const [future, setFuture] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showCorrectAnimation, setShowCorrectAnimation] = useState(false);
    const [dndQuestions, setDndQuestions] = useState<any[]>(theDndQuestions);

    const currentQuestion = dndQuestions[currentQuestionIndex];

    useEffect(() => {
        const storedQuestions = localStorage.getItem('dndQuestions');
        if (storedQuestions) {
            try {
                setDndQuestions(JSON.parse(storedQuestions));
            } catch (error) {
                setDndQuestions(theDndQuestions);
                localStorage.setItem('dndQuestions', JSON.stringify(theDndQuestions));
            }
        } else {
            // 'dndQuestions' item does not exist in localStorage
            setDndQuestions(theDndQuestions);
            localStorage.setItem('dndQuestions', JSON.stringify(theDndQuestions));
        }
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const symbol = e.dataTransfer.getData("text");
        setHistory((prevHistory) => [...prevHistory, userFormula]);
        setFuture([]);
        setUserFormula((prevFormula) => prevFormula + symbol);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent, symbol: string) => {
        e.dataTransfer.setData("text", symbol);
    };

    const handleUndo = () => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setFuture((prevFuture) => [userFormula, ...prevFuture]);
            setHistory(history.slice(0, -1));
            setUserFormula(lastState);
        }
    };

    const handleRedo = () => {
        if (future.length > 0) {
            const nextState = future[0];
            setHistory((prevHistory) => [...prevHistory, userFormula]);
            setFuture(future.slice(1));
            setUserFormula(nextState);
        }
    };

    const handleReset = () => {
        setUserFormula("");
        setHistory([]);
        setFuture([]);
    };

    const isCorrect = currentQuestion && userFormula === currentQuestion.correctFormula;

    useEffect(() => {
        if (currentQuestion && isCorrect) {
            setShowCorrectAnimation(true);
            
            if (currentQuestionIndex < dndQuestions.length - 1) {
                setTimeout(() => {
                    setShowCorrectAnimation(false);
                    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
                    setUserFormula("");
                    setHistory([]);
                    setFuture([]);
                }, 1500);
            } else {
                setTimeout(() => {
                    setShowCorrectAnimation(false);
                    setShowModal(true);
                }, 1500);
            }
        }
    }, [isCorrect, currentQuestionIndex, dndQuestions]);

    // Helper function to render the formula with subscripts
    const renderFormulaWithSubscripts = (formula: string) => {
        return formula.split(/(\d+)/g).map((part, index) => {
            if (/\d+/.test(part)) {
                return (
                    <sub key={index} style={{ fontSize: "1.2rem", paddingTop: "4px" }}>
                        {part}
                    </sub>
                );
            }
            return part;
        });
    };

    const handleTouchStart = (symbol: string) => {
        setHistory((prevHistory) => [...prevHistory, userFormula]);
        setFuture([]);
        setUserFormula((prevFormula) => prevFormula + symbol);
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const progressPercentage = ((currentQuestionIndex + 1) / dndQuestions.length) * 100;

    return (
        <IonApp>
            <IonPage>
                <IonHeader>
                    <IonToolbar color="primary" className="game-toolbar">
                        <IonButtons slot="start">
                            <IonButton size="large" onClick={handleBackClick}>
                                <IonIcon icon={arrowBack} style={{ fontSize: "1.5rem" }} />
                            </IonButton>
                        </IonButtons>
                        <IonTitle className="ion-text-center" style={{ fontSize: "1.5rem" }}>
                            <IonIcon icon={school} style={{ marginRight: "8px", fontSize: "1.5rem" }} />
                            Build a Chemical Compound
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding" fullscreen>
                    <IonGrid>
                        <IonRow>
                            <IonCol size="12">
                                <div className="progress-container mb-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className="progress-label">Question {currentQuestionIndex + 1} of {dndQuestions.length}</span>
                                        <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
                                    </div>
                                    <ProgressBar 
                                        now={progressPercentage} 
                                        variant="primary" 
                                        className="custom-progress" 
                                        style={{ height: "12px" }} 
                                    />
                                </div>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12">
                                <IonCard className="question-card mb-4" color="light">
                                    <IonCardHeader>
                                        <IonCardTitle className="ion-text-center" style={{ fontSize: "1.6rem" }}>
                                            Create: <strong>{currentQuestion?.name}</strong>
                                        </IonCardTitle>
                                    </IonCardHeader>
                                </IonCard>
                            </IonCol>
                        </IonRow>

                        <IonRow className="symbols-container mb-4">
                            {currentQuestion && currentQuestion.symbols && currentQuestion.symbols.map((symbol: any) => (
                                <IonCol size="4" sizeMd="3" key={symbol.id} className="mb-3">
                                    <div
                                        className="symbol-item"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, symbol.symbol)}
                                    >
                                        <IonChip
                                            color="primary"
                                            className="element-chip"
                                            style={{ 
                                                height: "50px", 
                                                width: "100%", 
                                                display: "flex", 
                                                justifyContent: "center",
                                                fontSize: "1.3rem",
                                                cursor: "pointer" 
                                            }}
                                            onClick={() => handleTouchStart(symbol.symbol)}
                                        >
                                            <IonLabel>{symbol.symbol}</IonLabel>
                                        </IonChip>
                                    </div>
                                </IonCol>
                            ))}
                        </IonRow>

                        <IonRow>
                            <IonCol size="12">
                                <div
                                    className={`drop-zone card p-4 ${isCorrect ? 'correct-answer' : ''} ${showCorrectAnimation ? 'animate-success' : ''}`}
                                    style={{
                                        minHeight: "200px",
                                        backgroundColor: "#f7f7f7",
                                        borderColor: "#007bff",
                                        borderWidth: "3px",
                                        borderStyle: "dashed",
                                        borderRadius: "12px",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                >
                                    <h3 className="mb-3">Drop Chemical Symbols Here</h3>
                                    <div 
                                        className="formula-display" 
                                        style={{ 
                                            fontSize: "2.5rem", 
                                            fontWeight: "bold",
                                            padding: "15px",
                                            minHeight: "70px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <IonText color={isCorrect ? "success" : userFormula ? "primary" : "medium"}>
                                            {userFormula ? renderFormulaWithSubscripts(userFormula) : "Your formula will appear here"}
                                        </IonText>
                                    </div>
                                    {userFormula && (
                                        <div 
                                            className="feedback-chip mt-3" 
                                            style={{ transform: "scale(1.2)" }}
                                        >
                                            {isCorrect ? (
                                                <IonChip color="success" className="status-chip">
                                                    <IonIcon icon={trophy} style={{ marginRight: "5px" }} />
                                                    <IonLabel>Correct!</IonLabel>
                                                </IonChip>
                                            ) : (
                                                <IonChip color="danger" className="status-chip">
                                                    <IonLabel>Try Again</IonLabel>
                                                </IonChip>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </IonCol>
                        </IonRow>

                        <IonRow className="mt-4">
                            <IonCol size="12" className="ion-text-center">
                                <div className="control-buttons">
                                    <IonButton
                                        color="secondary"
                                        size="large"
                                        onClick={handleUndo}
                                        disabled={history.length === 0}
                                        className="control-btn"
                                    >
                                        <IonIcon icon={arrowUndo} slot="start" style={{ fontSize: "1.3rem" }} /> 
                                        <span style={{ fontSize: "1.1rem" }}>Undo</span>
                                    </IonButton>
                                    <IonButton
                                        color="secondary"
                                        size="large"
                                        onClick={handleRedo}
                                        disabled={future.length === 0}
                                        className="control-btn mx-2"
                                    >
                                        <IonIcon icon={arrowRedo} slot="start" style={{ fontSize: "1.3rem" }} />
                                        <span style={{ fontSize: "1.1rem" }}>Redo</span>
                                    </IonButton>
                                    <IonButton 
                                        color="danger" 
                                        size="large" 
                                        onClick={handleReset} 
                                        className="control-btn"
                                    >
                                        <IonIcon icon={reload} slot="start" style={{ fontSize: "1.3rem" }} />
                                        <span style={{ fontSize: "1.1rem" }}>Reset</span>
                                    </IonButton>
                                </div>
                            </IonCol>
                        </IonRow>

                        <IonRow className="mt-4">
                            <IonCol size="12">
                                <IonCard className="instructions-card">
                                    <IonCardHeader>
                                        <IonCardTitle style={{ fontSize: "1.3rem" }}>Instructions:</IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent>
                                        <p style={{ fontSize: "1.1rem" }}>
                                            Drag and drop the chemical symbols to create the formula for {currentQuestion?.name}.
                                        </p>
                                        <p style={{ fontSize: "1.1rem" }}>
                                            You can also tap/click on the symbols to add them to your formula.
                                        </p>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    {/* Bootstrap Modal for completing all questions */}
                    <Modal show={showModal} onHide={handleModalClose} centered size="lg" className="completion-modal">
                        <Modal.Header closeButton className="congratulations-header">
                            <Modal.Title style={{ fontSize: "1.8rem" }}>Congratulations! 🎉</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-center py-4">
                            <div className="trophy-icon mb-3">
                                <IonIcon icon={trophy} style={{ fontSize: "5rem", color: "#FFD700" }} />
                            </div>
                            <h2 style={{ color: "#007bff", marginBottom: "20px" }}>You're a Chemistry Champion!</h2>
                            <p style={{ fontSize: "1.2rem" }}>
                                You have successfully completed all the chemical compound challenges.
                            </p>
                            <p style={{ fontSize: "1.1rem" }}>
                                You've demonstrated excellent knowledge of chemical formulas!
                            </p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button 
                                variant="primary" 
                                size="lg" 
                                onClick={handleModalClose}
                                style={{ fontSize: "1.1rem", padding: "10px 20px" }}
                            >
                                Play Again
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </IonContent>
            </IonPage>
        </IonApp>
    );
};

export default DndGame;