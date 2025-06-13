import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { useHistory } from "react-router-dom"; // For navigation
import { Html5QrcodeScanner } from "html5-qrcode";
import "./ArScan.css"; // Optional: Add styles for the scanner
import { arrowBack } from "ionicons/icons";
import table from "../../components/PeriodicTable";
import { parseAtomicWeight } from "../../components/utils";

const ArScan: React.FC = () => {
  const [scannedCodes, setScannedCodes] = useState<string[]>([]); // State to store scanned QR codes
  const history = useHistory();

  // Navigate back to the previous page
  const handleBackClick = () => {
    history.goBack();
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 500, height: 500 }, // Adjust scanner box size
        // highlightScanRegion: true, // Highlight the scanned QR code region with a square
        // highlights: {
          // cornerColor: "#FF0000", // Customize color of the corner square
          // borderColor: "#FF0000", // Customize color of the border around the QR code
        // },
      },
      true
    );

    scanner.render(
      (decodedText: string) => {
        console.log("QR Code detected:", decodedText);
        
        // Append detected QR code to the scanned codes array
        setScannedCodes((prevCodes) => {
          if (!prevCodes.includes(decodedText)) {
            return [...prevCodes, decodedText]; // Append only if not already in array
          }
          return prevCodes; // Return existing array if QR code is already scanned
        });

        alert(decodedText); // Optional: Display an alert or take other actions
        console.log(decodedText);
        
        const element = table.find((el) => el.name === decodedText);

        if (element) {
          // Set localStorage items for the element
          localStorage.setItem("elementName", element.name);
          localStorage.setItem("protons", parseAtomicWeight(element.atomicWeight));
          localStorage.setItem("electrons", parseAtomicWeight(element.atomicWeight));

          // Navigate to the next page, which will unmount the current component
          history.push("/dashboard/atom");

          // Optional: Clean up the scanner manually before navigating away
          scanner.clear();
        }
      },
      (errorMessage: string) => {
        console.log("QR Scan Error:", errorMessage);
      }
    );

    // Cleanup the scanner when the component unmounts
    return () => {
      scanner.clear();
    };
  }, [history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={handleBackClick}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>AR Scan</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div
          id="qr-reader"
          style={{ width: "100%", textAlign: "center" }}
        ></div>

        {/* Display the list of scanned QR codes */}
        <div style={{ marginTop: "20px" }}>
          <h3>Scanned QR Codes:</h3>
          <ul>
            {scannedCodes.map((code, index) => (
              <li key={index}>{code}</li>
            ))}
          </ul>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ArScan;
