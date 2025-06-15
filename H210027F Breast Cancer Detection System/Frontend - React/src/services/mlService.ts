import api from './api';

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: number[][];
}

export interface PredictionResult {
  id: string;
  result: 'Cancer' | 'Non-Cancer';
  confidence: number;
  heatmapUrl: string;
  regions: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  metrics?: ModelMetrics;
  explanations: string[];
}

export const mlService = {
  // Get the current model metrics
  getModelMetrics: async (): Promise<ModelMetrics> => {
    try {
      const response = await api.get('/model/metrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      throw error;
    }
  },

  // Predict with advanced options
  predictWithOptions: async (formData: FormData, options: { 
    generateHeatmap: boolean,
    confidenceThreshold: number,
    includeExplanations: boolean
  }): Promise<PredictionResult> => {
    try {
      // Add options to formData
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      const response = await api.post('/predict/advanced', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in advanced prediction:', error);
      throw error;
    }
  },

  // Get ROC curve data
  getROCCurveData: async (): Promise<{
    fpr: number[];
    tpr: number[];
    thresholds: number[];
    auc: number;
  }> => {
    try {
      const response = await api.get('/model/roc-curve');
      return response.data;
    } catch (error) {
      console.error('Error fetching ROC curve data:', error);
      throw error;
    }
  },

  // Get model performance over time
  getModelPerformanceHistory: async (): Promise<{
    dates: string[];
    accuracy: number[];
    precision: number[];
    recall: number[];
  }> => {
    try {
      const response = await api.get('/model/performance-history');
      return response.data;
    } catch (error) {
      console.error('Error fetching model performance history:', error);
      throw error;
    }
  }
};

export default mlService;
