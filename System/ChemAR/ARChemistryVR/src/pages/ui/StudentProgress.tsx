import React, { useEffect, useState } from "react";
import {
  IonApp,
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from "@ionic/react";
import { arrowBack } from "ionicons/icons"; // Import the back arrow icon
import StudentTestAnalysisChart from "../../components/chart/StudentTestAnalysisChart";
import StudentGamePerformanceChart from "../../components/chart/StudentGamePerformanceChart";
import StudentAverageScoreChart from "../../components/chart/StudentAverageScoreChart";
import StudentWheelAssessmentChart from "../../components/chart/StudentWheelAssessmentChart";

const StudentProgress: React.FC = () => {
  const [average, setAverage] = useState(0);
  const handleBackClick = () => {
    window.history.back();
  };

  useEffect(() => {
    // Retrieve the stored data from localStorage
    let studentChemistryStrengths: number[] = JSON.parse(
      localStorage.getItem("studentChemistryStrengths") || "[]"
    );
    let studentTestAnalysis: any = JSON.parse(
      localStorage.getItem("studentTestAnalysis") || "[]"
    );

    // Calculate the sum of all correct answers
    const totalCorrectAnswers = studentTestAnalysis.reduce(
      (sum :any , result : any) => sum + result.correctAnswers,
      0
    );

    // Calculate the average by dividing the total by the number of tests
    const averageScore = totalCorrectAnswers / studentTestAnalysis.length;

    if (studentChemistryStrengths.length > 0) {
      // Calculate the average
      const studentChemistryStrengthsAVE =
        studentChemistryStrengths.reduce((acc, curr) => acc + curr, 0) /
        studentChemistryStrengths.length;

      setAverage((studentChemistryStrengthsAVE + averageScore) / 2);
    }
  }, []);

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
            <IonTitle>Student Progress</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          {/* Card for Student Test Analysis Chart */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Student Test Analysis</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <StudentAverageScoreChart score={average} />
              <StudentTestAnalysisChart />
              {/* <StudentGamePerformanceChart /> */}
              <StudentWheelAssessmentChart />
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default StudentProgress;
