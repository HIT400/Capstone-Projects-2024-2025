import React, { useEffect, useRef, useState } from "react";
import table from "../../components/PeriodicTable";
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
} from "@ionic/react";
import { useHistory } from "react-router";
import { arrowBack, informationCircle } from "ionicons/icons";
import { parseAtomicWeight } from "../../components/utils";

// Element category colors based on standard periodic table conventions
const categoryColors = {
  alkaliMetal: "#FF6666", // Light red
  alkalineEarth: "#FFDEAD", // Pale orange
  transitionMetal: "#FFD700", // Gold
  postTransitionMetal: "#CCCCCC", // Light gray
  metalloid: "#CCCC99", // Pale green-yellow
  nonmetal: "#A0FFA0", // Light green
  halogen: "#FFFF90", // Light yellow
  nobleGas: "#C0FFFF", // Light cyan
  lanthanide: "#FFBFFF", // Light pink
  actinide: "#FF99CC", // Pink
  unknown: "#E8E8E8", // Very light gray
};

// Function to get element category
const getElementCategory = (element: any) => {
  const atomicNumber = parseInt(element.atomicNumber, 10);
  
  // This is a simplified categorization logic - in a full app you'd want more precise rules
  if ([1, 3, 11, 19, 37, 55, 87].includes(atomicNumber)) return "alkaliMetal";
  if ([4, 12, 20, 38, 56, 88].includes(atomicNumber)) return "alkalineEarth";
  if ([9, 17, 35, 53, 85, 117].includes(atomicNumber)) return "halogen";
  if ([2, 10, 18, 36, 54, 86, 118].includes(atomicNumber)) return "nobleGas";
  if (atomicNumber >= 57 && atomicNumber <= 71) return "lanthanide";
  if (atomicNumber >= 89 && atomicNumber <= 103) return "actinide";
  if ([5, 6, 7, 8, 15, 16, 34].includes(atomicNumber)) return "nonmetal";
  if ([13, 31, 49, 50, 81, 82, 83, 84, 114].includes(atomicNumber)) return "postTransitionMetal";
  if ([5, 14, 32, 33, 51, 52].includes(atomicNumber)) return "metalloid";
  if (atomicNumber > 103) return "unknown";
  
  return "transitionMetal"; // Default for transition metals
};

const Theory: React.FC = () => {
  const history = useHistory();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Adjust dimensions based on container size and zoom
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const elementSize = 70 * zoom; // Element size with zoom factor
    const spacing = 5 * zoom; // Reduced spacing
    const offsetX = 20 * zoom;
    const offsetY = 20 * zoom;
    
    // Calculate table dimensions
    const tableWidth = 18 * (elementSize + spacing) + offsetX * 2;
    const tableHeight = 10 * (elementSize + spacing) + offsetY * 2;

    canvas.width = Math.max(tableWidth, containerWidth);
    canvas.height = tableHeight;

    const drawPeriodicTable = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f4f5f8"; // Light background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 18; i++) {
        const x = i * (elementSize + spacing) + offsetX;
        ctx.beginPath();
        ctx.moveTo(x, offsetY);
        ctx.lineTo(x, 7 * (elementSize + spacing) + offsetY);
        ctx.stroke();
      }
      
      for (let i = 0; i <= 7; i++) {
        const y = i * (elementSize + spacing) + offsetY;
        ctx.beginPath();
        ctx.moveTo(offsetX, y);
        ctx.lineTo(18 * (elementSize + spacing) + offsetX, y);
        ctx.stroke();
      }

      // Draw period numbers
      ctx.fillStyle = "#666";
      ctx.font = `${14 * zoom}px Arial`;
      for (let i = 1; i <= 7; i++) {
        ctx.fillText(
          i.toString(),
          offsetX - 15 * zoom,
          i * (elementSize + spacing) + offsetY - spacing / 2
        );
      }

      // Draw group numbers
      for (let i = 1; i <= 18; i++) {
        ctx.fillText(
          i.toString(),
          i * (elementSize + spacing) + offsetX - elementSize / 2 - 5 * zoom,
          offsetY - 10 * zoom
        );
      }

      // Draw elements
      table.forEach((element) => {
        if (!element.column || !element.row) return; // Skip if no position
        
        const x = (element.column - 1) * (elementSize + spacing) + offsetX;
        const y = (element.row - 1) * (elementSize + spacing) + offsetY;

        // Get category color
        const category = getElementCategory(element);
        ctx.fillStyle = categoryColors[category as keyof typeof categoryColors];
        
        // Draw element box with rounded corners
        ctx.beginPath();
        const radius = 4 * zoom;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + elementSize - radius, y);
        ctx.quadraticCurveTo(x + elementSize, y, x + elementSize, y + radius);
        ctx.lineTo(x + elementSize, y + elementSize - radius);
        ctx.quadraticCurveTo(x + elementSize, y + elementSize, x + elementSize - radius, y + elementSize);
        ctx.lineTo(x + radius, y + elementSize);
        ctx.quadraticCurveTo(x, y + elementSize, x, y + elementSize - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
        
        // Element border
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1 * zoom;
        ctx.stroke();

        // Atomic number (top left)
        ctx.fillStyle = "#333";
        ctx.font = `${12 * zoom}px Arial`;
        ctx.fillText(
          element.atomicNumber.toString(),
          x + 5 * zoom,
          y + 15 * zoom
        );

        // Atomic weight (top right)
        ctx.font = `${10 * zoom}px Arial`;
        ctx.fillText(
          parseFloat(element.atomicWeight).toFixed(1),
          x + elementSize - 30 * zoom,
          y + 15 * zoom
        );

        // Element symbol (center)
        ctx.fillStyle = "#000";
        ctx.font = `bold ${24 * zoom}px Arial`;
        ctx.fillText(
          element.symbol,
          x + elementSize / 2 - 12 * zoom,
          y + elementSize / 2 + 5 * zoom
        );

        // Element name (bottom)
        ctx.fillStyle = "#333";
        ctx.font = `${10 * zoom}px Arial`;
        const nameWidth = ctx.measureText(element.name).width;
        ctx.fillText(
          element.name,
          x + elementSize / 2 - nameWidth / 2,
          y + elementSize - 10 * zoom
        );

        // Highlight selected element
        if (selectedElement && selectedElement.symbol === element.symbol) {
          ctx.strokeStyle = "#3880ff";
          ctx.lineWidth = 3 * zoom;
          ctx.stroke();
        }
      });

      // Draw lanthanide and actinide series labels
      ctx.fillStyle = "#666";
      ctx.font = `${12 * zoom}px Arial`;
      ctx.fillText("* Lanthanides", offsetX, 8 * (elementSize + spacing) + offsetY);
      ctx.fillText("** Actinides", offsetX, 9 * (elementSize + spacing) + offsetY);
    };

    drawPeriodicTable();

    const handleResize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        drawPeriodicTable();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedElement, zoom]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const elementSize = 70 * zoom;
    const spacing = 5 * zoom;
    const offsetX = 20 * zoom;
    const offsetY = 20 * zoom;

    // Find which element was clicked
    const clickedElement = table.find((element) => {
      if (!element.column || !element.row) return false;
      
      const x = (element.column - 1) * (elementSize + spacing) + offsetX;
      const y = (element.row - 1) * (elementSize + spacing) + offsetY;

      return (
        mouseX >= x &&
        mouseX <= x + elementSize &&
        mouseY >= y &&
        mouseY <= y + elementSize
      );
    });

    if (clickedElement) {
      setSelectedElement(clickedElement);
      localStorage.setItem("elementName", clickedElement.name);
      localStorage.setItem(
        "protons",
        parseAtomicWeight(clickedElement.atomicWeight)
      );
      localStorage.setItem(
        "electrons",
        parseAtomicWeight(clickedElement.atomicWeight)
      );
      localStorage.setItem(
        "atomicWeight",
        parseAtomicWeight(clickedElement.atomicWeight)
      );
    }
  };

  const handleElementSelect = () => {
    if (selectedElement) {
      history.push("/dashboard/atom");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Interactive Periodic Table</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setZoom(zoom * 1.2)}>
              Zoom +
            </IonButton>
            <IonButton onClick={() => setZoom(Math.max(0.5, zoom / 1.2))}>
              Zoom -
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Periodic Table of Elements</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12">
                  <div className="element-categories">
                    {Object.entries(categoryColors).map(([category, color]) => (
                      <IonChip key={category} style={{ backgroundColor: color , color : 'black' }}>
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </IonChip>
                    ))}
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        <div
          ref={containerRef}
          style={{
            width: "100%",
            maxWidth: "100%",
            height: "65vh",
            overflowX: "auto",
            overflowY: "auto",
            padding: "10px",
            position: "relative",
          }}
        >
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick} 
            style={{ cursor: "pointer" }} 
          />
        </div>

        {selectedElement && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{selectedElement.name} ({selectedElement.symbol})</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol>Atomic Number: {selectedElement.atomicNumber}</IonCol>
                  <IonCol>Atomic Weight: {selectedElement.atomicWeight}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol>Protons: {parseAtomicWeight(selectedElement.atomicWeight)}</IonCol>
                  <IonCol>Electrons: {parseAtomicWeight(selectedElement.atomicWeight)}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" className="ion-text-center ion-margin-top">
                    <IonButton 
                      expand="block" 
                      onClick={handleElementSelect}
                      color="primary"
                    >
                      <IonIcon icon={informationCircle} slot="start" />
                      View Atomic Structure
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Theory;