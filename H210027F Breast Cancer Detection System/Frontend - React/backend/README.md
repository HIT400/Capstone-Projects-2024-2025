# ScanClassify Pro Backend

This is the machine learning backend for the ScanClassify Pro application, providing breast cancer detection capabilities from mammography images.

## Features

- **Advanced ML Model**: Implements a deep learning model for breast cancer detection in mammography images
- **Heatmap Generation**: Creates visual heatmaps highlighting suspicious regions in scans
- **Model Performance Metrics**: Provides detailed metrics including accuracy, precision, recall, and AUC
- **ROC Curve Analysis**: Generates ROC curve data for model evaluation
- **Automatic Appointment Scheduling**: Creates appointments based on classification results

## Setup Instructions

### Prerequisites

- Python 3.8+
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Server

Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

## API Endpoints

- **GET /** - Root endpoint, returns API information
- **POST /predict** - Basic prediction endpoint
- **POST /predict/advanced** - Advanced prediction with customizable options
- **GET /history** - Get scan history
- **GET /model/metrics** - Get model performance metrics
- **GET /model/roc-curve** - Get ROC curve data
- **GET /model/performance-history** - Get model performance history
- **GET /statistics** - Get statistics about scan results and patient demographics

## Advanced ML Options

The `/predict/advanced` endpoint accepts the following parameters:

- **generateHeatmap** (boolean): Whether to generate a heatmap visualization
- **confidenceThreshold** (float): Confidence threshold for classification (0.0-1.0)
- **includeExplanations** (boolean): Whether to include medical explanations in the response

## Model Information

The current implementation uses a simulated model for demonstration purposes. In a production environment, you would replace this with a trained TensorFlow/PyTorch model.

To integrate your own model:

1. Place your trained model file in the appropriate directory
2. Update the model loading code in `main.py`
3. Modify the prediction function to use your model

## Extending the Backend

To extend the backend with additional features:

1. Add new endpoints in `main.py`
2. Implement additional model capabilities
3. Update the requirements.txt file if new dependencies are needed

## Troubleshooting

If you encounter issues:

- Check that all dependencies are installed
- Verify that the correct Python version is being used
- Ensure that the port 8000 is available
- Check the logs for detailed error information
