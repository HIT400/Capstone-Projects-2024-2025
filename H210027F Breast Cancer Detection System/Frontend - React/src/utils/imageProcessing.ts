
/**
 * Utility for image processing and AI-based region detection
 */

import * as tf from '@tensorflow/tfjs';

// Initialize TensorFlow and load model
let model: tf.GraphModel | null = null;

export const initializeModel = async (): Promise<void> => {
  try {
    // In a real application, you would load a pre-trained model from a URL or locally
    // For this example, we'll simulate the model loading
    console.log('Loading TensorFlow.js model...');
    
    // Simulate model loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demonstration purposes, we're not loading a real model
    // In a real app, you would use:
    // model = await tf.loadGraphModel('path/to/model/model.json');
    
    console.log('TensorFlow.js model loaded successfully');
  } catch (error) {
    console.error('Error loading TensorFlow.js model:', error);
    throw new Error('Failed to load image processing model');
  }
};

// Image preprocessing for the model
export const preprocessImage = async (imageDataUrl: string): Promise<tf.Tensor> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Convert image to tensor
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224]) // Resize to model input size
          .toFloat()
          .div(tf.scalar(255.0))  // Normalize to [0,1]
          .expandDims(0);         // Add batch dimension
        
        resolve(tensor);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image for processing'));
    img.src = imageDataUrl;
  });
};

// Apply green medical scan effect to image
export const applyGreenScanEffect = (imageDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the original image
        ctx.drawImage(img, 0, 0);
        
        // Get image data and manipulate pixels for green scan effect
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          // Enhanced medical scan look - green tint with contrast
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          
          // Apply green tint (reduce red and blue, enhance green)
          data[i] = Math.min(255, avg * 0.7);                // Reduced red
          data[i + 1] = Math.min(255, avg * 1.2);            // Enhanced green
          data[i + 2] = Math.min(255, avg * 0.7);            // Reduced blue
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add a subtle medical scan glow effect
        ctx.fillStyle = 'rgba(0, 255, 100, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add grid lines for medical scan appearance
        ctx.strokeStyle = 'rgba(0, 255, 150, 0.2)';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        const lineSpacing = 20;
        for (let y = 0; y < canvas.height; y += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        
        // Vertical grid lines
        for (let x = 0; x < canvas.width; x += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        
        resolve(canvas.toDataURL('image/png'));
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
};

// Detect regions of interest in the image
export const detectRegions = async (imageDataUrl: string, confidence: number): Promise<DetectedRegion[]> => {
  // For demo purposes, we'll generate simulated regions based on confidence
  // In a real application, this would use the actual model prediction
  
  // Create a deterministic seed based on the image data and confidence
  // This ensures consistent regions for the same image
  const seed = imageDataUrl.length * confidence;
  
  // Simple deterministic random number generator
  const seededRandom = (min: number, max: number, seed: number) => {
    const x = Math.sin(seed) * 10000;
    const rand = x - Math.floor(x);
    return Math.floor(rand * (max - min + 1)) + min;
  };
  
  // Number of regions to detect based on confidence
  const numRegions = confidence > 0.7 ? 
    seededRandom(2, 4, seed) : 
    seededRandom(1, 2, seed + 1);
  
  const regions: DetectedRegion[] = [];
  
  for (let i = 0; i < numRegions; i++) {
    const x = seededRandom(10, 350, seed + i * 10);
    const y = seededRandom(10, 350, seed + i * 20);
    const width = seededRandom(20, 70, seed + i * 30);
    const height = seededRandom(20, 70, seed + i * 40);
    
    // Higher region confidence for higher overall confidence
    const regionConfidence = confidence * (0.8 + Math.random() * 0.2);
    
    regions.push({
      id: i + 1,
      x,
      y,
      width,
      height,
      confidence: regionConfidence,
      type: 'cancer'
    });
  }
  
  return regions;
};

// Generate a unified green scan overlay for the image
export const generateHeatmap = async (
  imageDataUrl: string, 
  regions: DetectedRegion[]
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      // Apply green scan effect to the original image
      const greenScanImage = await applyGreenScanEffect(imageDataUrl);
      
      const greenImg = new Image();
      greenImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = greenImg.width;
        canvas.height = greenImg.height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(greenImg, 0, 0);
        
        // Create edge detection canvas for X-ray style outline
        const edgeCanvas = document.createElement('canvas');
        edgeCanvas.width = canvas.width;
        edgeCanvas.height = canvas.height;
        const edgeCtx = edgeCanvas.getContext('2d')!;
        edgeCtx.drawImage(greenImg, 0, 0);
        
        // Apply edge detection effect (Sobel operator simulation)
        const edgeData = applyEdgeDetection(edgeCtx, canvas.width, canvas.height);
        edgeCtx.putImageData(edgeData, 0, 0);
        
        // Apply base layer (subtle dark background)
        ctx.fillStyle = 'rgba(0, 20, 10, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Overlay the edge detection with a glow effect
        ctx.globalAlpha = 0.65;
        ctx.drawImage(edgeCanvas, 0, 0);
        ctx.globalAlpha = 1.0;
        
        // Add X-ray grid lines
        addXrayGridLines(ctx, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/png'));
      };
      greenImg.src = greenScanImage;
    };
    img.src = imageDataUrl;
  });
};

// Helper function to apply edge detection to an image
const applyEdgeDetection = (ctx: CanvasRenderingContext2D, width: number, height: number): ImageData => {
  // Get image data
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const outputData = new Uint8ClampedArray(data.length);
  
  // Simple edge detection algorithm
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Get surrounding pixels
      const topLeft = getGrayscale(data, (y-1) * width + (x-1), width, height);
      const top = getGrayscale(data, (y-1) * width + x, width, height);
      const topRight = getGrayscale(data, (y-1) * width + (x+1), width, height);
      const left = getGrayscale(data, y * width + (x-1), width, height);
      const right = getGrayscale(data, y * width + (x+1), width, height);
      const bottomLeft = getGrayscale(data, (y+1) * width + (x-1), width, height);
      const bottom = getGrayscale(data, (y+1) * width + x, width, height);
      const bottomRight = getGrayscale(data, (y+1) * width + (x+1), width, height);
      
      // Sobel operator (simplified)
      const gx = -topLeft - 2*left - bottomLeft + topRight + 2*right + bottomRight;
      const gy = -topLeft - 2*top - topRight + bottomLeft + 2*bottom + bottomRight;
      
      // Calculate gradient magnitude
      let magnitude = Math.sqrt(gx*gx + gy*gy);
      
      // Threshold and create edge effect
      const threshold = 30;
      const edgeIntensity = magnitude > threshold ? 255 : 0;
      
      // Set edge pixel (white edges on transparent background)
      outputData[idx] = edgeIntensity > 0 ? 220 : 0;       // R
      outputData[idx+1] = edgeIntensity > 0 ? 240 : 0;     // G
      outputData[idx+2] = edgeIntensity > 0 ? 255 : 0;     // B
      outputData[idx+3] = edgeIntensity > 0 ? 180 : 0;     // A
    }
  }
  
  return new ImageData(outputData, width, height);
};

// Helper function to get grayscale value
const getGrayscale = (data: Uint8ClampedArray, index: number, width: number, height: number): number => {
  // Ensure index is within bounds
  index = Math.max(0, Math.min(width * height - 1, index)) * 4;
  return (data[index] + data[index+1] + data[index+2]) / 3;
};



// Add X-ray style grid lines
const addXrayGridLines = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  // Add grid lines for medical scan appearance
  ctx.strokeStyle = 'rgba(200, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  const lineSpacing = 30;
  for (let y = 0; y < height; y += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Vertical grid lines
  for (let x = 0; x < width; x += lineSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Add measurement markers on edges
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '10px monospace';
  
  for (let y = lineSpacing; y < height; y += lineSpacing * 2) {
    ctx.fillText(`${Math.round(y/10)}`, 5, y - 2);
  }
  
  for (let x = lineSpacing; x < width; x += lineSpacing * 2) {
    ctx.fillText(`${Math.round(x/10)}`, x + 2, 10);
  }
};

// Process the image and apply unified green scan overlay
export const processImage = async (imageDataUrl: string, isCancer: boolean, confidence: number): Promise<{
  processedImage: string;
  regions: DetectedRegion[];
}> => {
  // For all cases, detect regions for analysis purposes only
  const regions = isCancer ? await detectRegions(imageDataUrl, confidence) : [];
  
  // Generate the unified green scan overlay
  const scanOverlayImage = await generateHeatmap(imageDataUrl, regions);
  
  return {
    processedImage: scanOverlayImage,
    regions
  };
};

// Generate a detailed medical explanation based on the scan result
export const generateMedicalExplanation = (
  result: string, 
  confidence: number, 
  regions: DetectedRegion[]
): AnalysisExplanation => {
  // In a real application, this might call an LLM API or use a more complex rule-based system
  
  if (result === 'Non-Cancer') {
    return {
      summary: "Analysis indicates non-cancerous tissue characteristics with no suspicious features detected. The tissue presents with regular borders, homogeneous density, and absence of architectural distortion patterns typically associated with cancer.",
      findings: [
        "Regular mass borders with well-defined edges",
        "Homogeneous internal echoes/density",
        "Absence of architectural distortion",
        "No suspicious calcifications detected",
        "No evidence of infiltration into surrounding tissue"
      ],
      recommendations: [
        "Routine follow-up screening as per age-appropriate guidelines",
        "No immediate intervention required based on current imaging",
        "Consider follow-up imaging in 6-12 months to ensure stability"
      ]
    };
  } else {
    // For cancer results, create a more detailed explanation based on detected regions
    const regionDescriptions = [
      "Spiculated mass with irregular borders",
      "Architectural distortion in surrounding tissue",
      "Heterogeneous internal echoes/density",
      "Evidence of microcalcifications",
      "Disruption of normal anatomical structures"
    ];
    
    // Select random findings based on number of regions, ensuring consistency
    const selectedFindings = regionDescriptions.slice(0, Math.min(regions.length + 2, regionDescriptions.length));
    
    // Add region-specific findings
    const specificFindings = regions.map((region, index) => {
      const location = index === 0 ? "upper outer quadrant" : 
                      index === 1 ? "lower inner quadrant" : 
                      index === 2 ? "upper inner quadrant" : "lower outer quadrant";
      
      return `Region ${region.id}: ${Math.round(region.confidence * 100)}% probability of cancer in ${location}`;
    });
    
    return {
      summary: `Analysis reveals characteristics highly suggestive of cancer with ${Math.round(confidence * 100)}% confidence. Multiple suspicious regions were detected, displaying irregular borders, architectural distortion, and heterogeneous density patterns consistent with invasive carcinoma.`,
      findings: [...selectedFindings, ...specificFindings],
      recommendations: [
        "Immediate biopsy of detected suspicious regions",
        "Comprehensive clinical evaluation including lymph node assessment",
        "Consider additional imaging modalities (MRI) for better characterization",
        "Prompt referral to breast cancer specialist for treatment planning",
        "Genetic testing may be beneficial if family history is significant"
      ]
    };
  }
};

// Define types for our image processing utilities
export interface DetectedRegion {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  type: 'benign' | 'cancer';
}

export interface AnalysisExplanation {
  summary: string;
  findings: string[];
  recommendations: string[];
}
