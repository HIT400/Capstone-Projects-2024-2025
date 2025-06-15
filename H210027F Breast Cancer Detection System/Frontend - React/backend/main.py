from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import numpy as np
import tensorflow as tf
import cv2
import io
import os
import json
from datetime import datetime, timedelta
import random
from PIL import Image
import uuid

app = FastAPI(title="ScanClassify Pro API", description="API for breast cancer detection from mammography images")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Placeholder for model loading
# In a real implementation, you would load your trained model here
# model = tf.keras.models.load_model("path/to/your/model")

# Simulated patient database
PATIENTS_DB = []
SCAN_HISTORY = []
MODEL_METRICS = {
    "accuracy": 0.92,
    "precision": 0.89,
    "recall": 0.94,
    "f1Score": 0.91,
    "auc": 0.95,
    "confusionMatrix": [
        [120, 15],
        [8, 157]
    ]
}

# Model performance history (simulated)
PERFORMANCE_HISTORY = {
    "dates": [
        (datetime.now() - timedelta(days=180)).strftime("%b %Y"),
        (datetime.now() - timedelta(days=150)).strftime("%b %Y"),
        (datetime.now() - timedelta(days=120)).strftime("%b %Y"),
        (datetime.now() - timedelta(days=90)).strftime("%b %Y"),
        (datetime.now() - timedelta(days=60)).strftime("%b %Y"),
        (datetime.now() - timedelta(days=30)).strftime("%b %Y"),
        datetime.now().strftime("%b %Y")
    ],
    "accuracy": [0.85, 0.87, 0.88, 0.90, 0.91, 0.92, 0.93],
    "precision": [0.82, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89],
    "recall": [0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94]
}

# ROC curve data (simulated)
ROC_CURVE_DATA = {
    "fpr": [0.0, 0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    "tpr": [0.0, 0.4, 0.6, 0.7, 0.8, 0.85, 0.9, 0.92, 0.94, 0.95, 0.97, 0.98, 1.0],
    "thresholds": [1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.02, 0.0],
    "auc": 0.95
}

# Helper function to extract patient info
def extract_patient_info(patient_name: str, patient_age: str, patient_gender: str):
    # Try to extract age and gender from name if they're in the format "Name (Age / Gender)"
    age = int(patient_age) if patient_age.isdigit() else 0
    gender = patient_gender.lower() if patient_gender else "unknown"
    
    # Check if name contains age/gender info in parentheses
    if "(" in patient_name and ")" in patient_name:
        info_part = patient_name.split("(")[1].split(")")[0]
        if "/" in info_part:
            parts = info_part.split("/")
            if len(parts) == 2:
                age_str = parts[0].strip()
                gender_str = parts[1].strip()
                
                if age_str.isdigit():
                    age = int(age_str)
                
                gender = gender_str.lower()
    
    return {
        "name": patient_name,
        "age": age,
        "gender": gender
    }

# Helper function to generate a heatmap
def generate_heatmap(image_bytes):
    # In a real implementation, you would use the model to generate a heatmap
    # This is a placeholder that creates a simple green overlay
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        image_np = np.array(image)
        
        # Create a simple green overlay (in a real implementation, this would be based on model output)
        overlay = np.zeros_like(image_np)
        h, w = image_np.shape[:2]
        
        # Simulate some "suspicious" regions
        for _ in range(3):
            x = random.randint(w//4, 3*w//4)
            y = random.randint(h//4, 3*h//4)
            radius = random.randint(20, 50)
            intensity = random.uniform(0.5, 1.0)
            
            cv2.circle(overlay, (x, y), radius, (0, int(255 * intensity), 0), -1)
        
        # Blend the overlay with the original image
        alpha = 0.3
        output = cv2.addWeighted(image_np, 1, overlay, alpha, 0)
        
        # Convert back to PIL Image and then to bytes
        output_image = Image.fromarray(output)
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG")
        
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error generating heatmap: {e}")
        return None

# Helper function to simulate model prediction
def predict_cancer(image_bytes, confidence_threshold=0.5):
    # In a real implementation, you would use your trained model here
    # For now, we'll simulate a prediction
    
    # Generate a random confidence score (higher for larger images as a simple heuristic)
    image = Image.open(io.BytesIO(image_bytes))
    width, height = image.size
    image_size = width * height
    
    # Base the confidence partly on image size (larger images might have more detail)
    # and partly on randomness to simulate different predictions
    base_confidence = min(0.5 + (image_size / (1024 * 1024 * 10)), 0.9)
    confidence = random.uniform(base_confidence - 0.2, base_confidence + 0.2)
    confidence = max(0.1, min(confidence, 0.99))  # Clamp between 0.1 and 0.99
    
    # Determine result based on confidence and threshold
    result = "Cancer" if confidence > confidence_threshold else "Non-Cancer"
    
    # Generate some regions of interest
    regions = []
    if result == "Cancer":
        num_regions = random.randint(1, 3)
        for _ in range(num_regions):
            regions.append({
                "x": random.randint(0, width - 100),
                "y": random.randint(0, height - 100),
                "width": random.randint(50, 100),
                "height": random.randint(50, 100),
                "confidence": random.uniform(confidence - 0.1, confidence)
            })
    
    # Generate medical explanations
    explanations = []
    if result == "Cancer":
        explanations = [
            "The scan shows patterns consistent with malignant tissue.",
            "Suspicious neoplastic lesion identified—biopsy recommended.",
            "Further diagnostic imaging (MRI) may be beneficial for treatment planning.",
            "Consider genetic testing for BRCA1/BRCA2 mutations depending on family history."
        ]
    else:
        explanations = [
            "No malignant pathology detected in the current scan.",
            "Tissue appears normal with no suspicious masses or calcifications.",
            "Routine surveillance advised according to standard screening protocols.",
            "Patient should continue regular self-examinations."
        ]
    
    return {
        "result": result,
        "confidence": confidence,
        "regions": regions,
        "explanations": explanations
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to ScanClassify Pro API", "version": "1.0.0"}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    patient_age: str = Form(...),
    patient_gender: str = Form(...)
):
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Extract patient information
        patient_info = extract_patient_info(patient_name, patient_age, patient_gender)
        
        # Make prediction
        prediction = predict_cancer(contents)
        
        # Generate a unique ID for this scan
        scan_id = str(uuid.uuid4())
        
        # Store the scan in history
        scan_record = {
            "id": scan_id,
            "patient": patient_info,
            "result": prediction["result"],
            "confidence": prediction["confidence"],
            "date": datetime.now().isoformat(),
            "regions": prediction["regions"]
        }
        SCAN_HISTORY.append(scan_record)
        
        # Return the prediction result
        return {
            "id": scan_id,
            "result": prediction["result"],
            "confidence": prediction["confidence"],
            "regions": prediction["regions"],
            "patient": patient_info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/advanced")
async def predict_advanced(
    file: UploadFile = File(...),
    patient_name: str = Form(...),
    patient_age: str = Form(...),
    patient_gender: str = Form(...),
    generateHeatmap: bool = Form(True),
    confidenceThreshold: float = Form(0.5),
    includeExplanations: bool = Form(True)
):
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Extract patient information
        patient_info = extract_patient_info(patient_name, patient_age, patient_gender)
        
        # Make prediction with custom threshold
        prediction = predict_cancer(contents, confidenceThreshold)
        
        # Generate heatmap if requested
        heatmap_url = None
        if generateHeatmap:
            # In a real implementation, you would save the heatmap to a file and return the URL
            # For now, we'll just indicate that a heatmap was generated
            heatmap_url = f"/heatmaps/scan_{uuid.uuid4()}.png"
        
        # Generate a unique ID for this scan
        scan_id = str(uuid.uuid4())
        
        # Store the scan in history
        scan_record = {
            "id": scan_id,
            "patient": patient_info,
            "result": prediction["result"],
            "confidence": prediction["confidence"],
            "date": datetime.now().isoformat(),
            "regions": prediction["regions"],
            "heatmapUrl": heatmap_url
        }
        SCAN_HISTORY.append(scan_record)
        
        # Prepare response
        response = {
            "id": scan_id,
            "result": prediction["result"],
            "confidence": prediction["confidence"],
            "regions": prediction["regions"],
            "patient": patient_info,
            "heatmapUrl": heatmap_url
        }
        
        # Include explanations if requested
        if includeExplanations:
            response["explanations"] = prediction["explanations"]
        
        # Include model metrics
        response["metrics"] = MODEL_METRICS
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    # Sort history by date (newest first)
    sorted_history = sorted(SCAN_HISTORY, key=lambda x: x.get("date", ""), reverse=True)
    return {"history": sorted_history}

@app.get("/model/metrics")
async def get_model_metrics():
    return MODEL_METRICS

@app.get("/model/roc-curve")
async def get_roc_curve():
    return ROC_CURVE_DATA

@app.get("/model/performance-history")
async def get_performance_history():
    return PERFORMANCE_HISTORY

@app.get("/statistics")
async def get_statistics():
    # Calculate statistics from scan history
    if not SCAN_HISTORY:
        return {
            "totalScans": 0,
            "cancerPercentage": 0,
            "nonCancerPercentage": 0,
            "averageAge": 0,
            "malePercentage": 0,
            "femalePercentage": 0,
            "unknownGenderPercentage": 100,
            "genderConfidence": 0,
            "patientData": [],
            "genderData": [
                {"name": "Male", "value": 0},
                {"name": "Female", "value": 0},
                {"name": "Unknown", "value": 0}
            ]
        }
    
    total_scans = len(SCAN_HISTORY)
    cancer_scans = sum(1 for scan in SCAN_HISTORY if scan.get("result") == "Cancer")
    
    # Gender counts
    male_count = sum(1 for scan in SCAN_HISTORY if scan.get("patient", {}).get("gender", "").lower() in ["male", "m"])
    female_count = sum(1 for scan in SCAN_HISTORY if scan.get("patient", {}).get("gender", "").lower() in ["female", "f"])
    unknown_gender = total_scans - male_count - female_count
    
    # Age calculation
    ages = [scan.get("patient", {}).get("age", 0) for scan in SCAN_HISTORY]
    average_age = sum(ages) / len(ages) if ages else 0
    
    # Gender percentages
    male_percentage = (male_count / total_scans) * 100 if total_scans > 0 else 0
    female_percentage = (female_count / total_scans) * 100 if total_scans > 0 else 0
    unknown_gender_percentage = (unknown_gender / total_scans) * 100 if total_scans > 0 else 0
    
    # Extract patient data for frontend processing
    patient_data = [scan.get("patient", {}) for scan in SCAN_HISTORY]
    
    # Gender data for charts
    gender_data = [
        {"name": "Male", "value": male_count},
        {"name": "Female", "value": female_count}
    ]
    if unknown_gender > 0:
        gender_data.append({"name": "Unknown", "value": unknown_gender})
    
    return {
        "totalScans": total_scans,
        "cancerPercentage": (cancer_scans / total_scans) * 100 if total_scans > 0 else 0,
        "nonCancerPercentage": ((total_scans - cancer_scans) / total_scans) * 100 if total_scans > 0 else 0,
        "averageAge": average_age,
        "malePercentage": male_percentage,
        "femalePercentage": female_percentage,
        "unknownGenderPercentage": unknown_gender_percentage,
        "genderConfidence": 85,  # Simulated confidence in gender detection
        "patientData": patient_data,
        "genderData": gender_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
