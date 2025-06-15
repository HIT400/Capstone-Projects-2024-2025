
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface ScanProcessingAnimationProps {
  imageUrl: string;
}

const ScanProcessingAnimation: React.FC<ScanProcessingAnimationProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Initializing analysis...');
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      // Set canvas dimensions to match image dimensions (preserving aspect ratio)
      const maxDimension = 400;
      let width = img.width;
      let height = img.height;
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Apply greenish scan effect
      ctx.drawImage(img, 0, 0, width, height);
      
      // Apply a green tint to the image
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Enhance green channel and reduce red/blue for medical scan appearance
        data[i] = data[i] * 0.7; // Reduce red
        data[i + 2] = data[i + 2] * 0.7; // Reduce blue
        // Green is left as is or slightly enhanced
        data[i + 1] = Math.min(255, data[i + 1] * 1.2);
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Start the scanning animation
      let scanLine = 0;
      const scanSpeed = 2;
      const scanInterval = setInterval(() => {
        // Redraw the green-tinted image
        ctx.putImageData(imageData, 0, 0);
        
        // Draw a horizontal scanning line
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, scanLine);
        ctx.lineTo(width, scanLine);
        ctx.stroke();
        
        // Draw glow effect
        const gradient = ctx.createLinearGradient(0, scanLine - 10, 0, scanLine + 10);
        gradient.addColorStop(0, 'rgba(0, 255, 200, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 200, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 200, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, scanLine - 10, width, 20);
        
        // Draw some "detected features" randomly as the scan progresses
        if (scanLine > 50) {
          // Only start showing detections after the scan has progressed a bit
          for (let i = 0; i < 5; i++) {
            // Only draw features that have been "scanned" already
            const featureY = Math.random() * scanLine;
            const featureX = Math.random() * width;
            const featureSize = 3 + Math.random() * 8;
            
            ctx.beginPath();
            ctx.arc(featureX, featureY, featureSize, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 50, 50, 0.8)';
            ctx.stroke();
          }
        }
        
        // Update scan line position
        scanLine += scanSpeed;
        
        // Update animation progress (0-100%)
        const progress = Math.min(100, Math.floor((scanLine / height) * 100));
        setAnimationProgress(progress);
        
        // Update status message
        if (progress < 20) {
          setStatusMessage('Initializing analysis...');
        } else if (progress < 40) {
          setStatusMessage('Applying green scan filter...');
        } else if (progress < 60) {
          setStatusMessage('Detecting tissue patterns...');
        } else if (progress < 80) {
          setStatusMessage('Analyzing cellular structures...');
        } else {
          setStatusMessage('Finalizing classification...');
        }
        
        // Stop when scan is complete
        if (scanLine > height) {
          clearInterval(scanInterval);
        }
      }, 50);
      
      // Clean up interval
      return () => clearInterval(scanInterval);
    };
    
    img.src = imageUrl;
  }, [imageUrl]);
  
  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-center text-primary">AI Scan Analysis In Progress</h3>
      
      <div className="w-full max-w-md relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-auto rounded-lg shadow-md"
        />
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />
      </div>
      
      <div className="w-full max-w-md">
        <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
          <span>{statusMessage}</span>
          <span>{animationProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${animationProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScanProcessingAnimation;
