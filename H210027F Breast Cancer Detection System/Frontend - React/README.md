# ScanClassify Pro

An advanced medical imaging platform for breast cancer detection and analysis using machine learning.

## Overview

ScanClassify Pro is a comprehensive solution for healthcare professionals to analyze mammography scans, detect potential breast cancer, and manage patient appointments. The application leverages advanced machine learning techniques to provide accurate classifications with visual explanations.

## Key Features

### Advanced ML Classification
- Deep learning model for breast cancer detection
- Confidence threshold adjustment
- Visual heatmap generation highlighting suspicious regions
- Medical explanations for classification results

### Diagnostic Reports
- Automated PDF report generation
- Detailed patient information and scan results
- Medical recommendations based on classification
- Downloadable and printable formats

### Visual Analytics
- Model performance metrics (accuracy, precision, recall, F1 score)
- ROC curve analysis with AUC visualization
- Confusion matrix visualization
- Performance history tracking

### Appointment Management
- Automatic appointment scheduling based on scan results
- Priority scheduling for malignant cases
- Calendar integration with appointment details
- Patient notification system

## Technology Stack

### Frontend
- React with TypeScript
- Shadcn UI components
- Tailwind CSS for styling
- Recharts for data visualization
- Framer Motion for animations
- jsPDF for report generation

### Backend
- FastAPI (Python)
- TensorFlow/PyTorch for ML model
- OpenCV for image processing
- NumPy for numerical operations

## Getting Started

### Prerequisites
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Python 3.8+ (for backend)

### Frontend Setup
```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd scanclassify-pro-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```sh
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Project Structure

```
scanclassify-pro/
├── src/
│   ├── components/
│   │   ├── analytics/       # Model performance visualization
│   │   ├── appointments/    # Appointment management
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Layout components
│   │   ├── reports/         # Diagnostic report generation
│   │   ├── scan/            # Scan upload and processing
│   │   └── ui/              # UI components
│   ├── context/             # React context providers
│   ├── pages/               # Application pages
│   ├── services/            # API and ML services
│   └── utils/               # Utility functions
├── backend/
│   ├── main.py              # FastAPI backend
│   └── requirements.txt     # Python dependencies
└── public/                  # Static assets
```

## Deployment

The application can be deployed as two separate services:

1. Frontend: Deploy to Netlify, Vercel, or similar services
2. Backend: Deploy to a service that supports Python (Heroku, AWS, GCP, etc.)

Make sure to update the API endpoints in the frontend to point to your deployed backend.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
