
import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, Layers, Download, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getImage } from '@/utils/localImageStorage';
import { 
  detectRegions, 
  generateHeatmap, 
  generateMedicalExplanation,
  DetectedRegion,
  AnalysisExplanation,
  processImage,
  applyGreenScanEffect
} from '@/utils/imageProcessing';

interface ScanImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imagePath: string;
  patientName: string;
  result: {
    result: string;
    confidence: number;
    localImageId?: string;
  };
}

const ScanImageModal: React.FC<ScanImageModalProps> = ({ 
  isOpen, 
  onClose, 
  imagePath, 
  patientName,
  result
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeTab, setActiveTab] = useState("image");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null);
  const [detectedRegions, setDetectedRegions] = useState<DetectedRegion[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisExplanation | null>(null);
  const [displayMode, setDisplayMode] = useState<'original' | 'processed' | 'heatmap'>('processed');
  
  const isCancer = result.result === 'Cancer';
  
  // On modal open, try to load the local image if available
  useEffect(() => {
    if (isOpen && result.localImageId) {
      const loadLocalImage = async () => {
        try {
          const imageData = await getImage(result.localImageId!);
          if (imageData) {
            setLocalImage(imageData);
            
            // Process the image (apply green scan effect and detect regions if cancer)
            const processed = await processImage(
              imageData, 
              isCancer, 
              result.confidence
            );
            
            setProcessedImage(processed.processedImage);
            setDetectedRegions(processed.regions);
            
            // Generate heatmap if cancer
            if (isCancer) {
              const heatmap = await generateHeatmap(imageData, processed.regions);
              setHeatmapImage(heatmap);
            } else {
              // For non-cancer, just apply the green scan effect for the heatmap view
              const greenScan = await applyGreenScanEffect(imageData);
              setHeatmapImage(greenScan);
            }
            
            // Generate medical explanation
            const explanation = generateMedicalExplanation(
              result.result, 
              result.confidence, 
              processed.regions
            );
            setAnalysis(explanation);
          }
        } catch (error) {
          console.error('Error loading or processing local image:', error);
        }
      };
      
      loadLocalImage();
    }
  }, [isOpen, result, isCancer]);
  
  // Reset zoom level and other settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setShowAnnotations(true);
      setImageLoaded(false);
      setActiveTab("image");
      setDisplayMode('processed');
    }
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const toggleAnnotations = () => {
    setShowAnnotations(prev => !prev);
  };
  
  const toggleDisplayMode = () => {
    if (displayMode === 'original') setDisplayMode('processed');
    else if (displayMode === 'processed') setDisplayMode('heatmap');
    else setDisplayMode('original');
  };

  const downloadImage = () => {
    // Create a link to download the current view
    const link = document.createElement('a');
    let imageToDownload = '';
    
    if (displayMode === 'heatmap' && heatmapImage) {
      imageToDownload = heatmapImage;
    } else if (displayMode === 'processed' && processedImage) {
      imageToDownload = processedImage;
    } else if (localImage) {
      imageToDownload = localImage;
    } else {
      imageToDownload = imagePath;
    }
      
    link.href = imageToDownload;
    link.download = `${patientName.replace(/\s+/g, '_')}_scan_analysis.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // For debugging
  useEffect(() => {
    console.log('Result image path:', imagePath);
    console.log('Local image available:', !!localImage);
    console.log('Processed image available:', !!processedImage);
    console.log('Using display mode:', displayMode);
    console.log('Is cancer:', isCancer);
  }, [imagePath, localImage, processedImage, displayMode, isCancer]);

  // Determine which image to display based on mode
  const displayImage = () => {
    if (displayMode === 'heatmap' && heatmapImage) {
      return heatmapImage;
    } else if (displayMode === 'processed' && processedImage) {
      return processedImage;
    } else if (localImage) {
      return localImage;
    }
    return imagePath;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogTitle className="sr-only">Advanced Scan Analysis</DialogTitle>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Advanced Scan Analysis: {patientName}
          </h3>
          <DialogClose asChild>
            <button 
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="image">Enhanced Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="image" className="mt-0">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-wrap justify-end gap-2 mb-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
                </Button>
                <Button 
                  variant={showAnnotations ? "default" : "outline"}
                  size="sm" 
                  onClick={toggleDisplayMode}
                >
                  {displayMode === 'original' ? (
                    <Eye className="h-4 w-4 mr-1" />
                  ) : displayMode === 'processed' ? (
                    <Layers className="h-4 w-4 mr-1" />
                  ) : (
                    <Eye className="h-4 w-4 mr-1" />
                  )}
                  {displayMode === 'original' ? "Show Green Scan" : 
                   displayMode === 'processed' ? "Show Heatmap" : "Original Image"}
                </Button>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={downloadImage}
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden relative">
                <div 
                  className="overflow-auto"
                  style={{ 
                    maxHeight: '60vh',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{ 
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.2s ease'
                    }}
                    className="relative"
                  >
                    <img 
                      src={displayImage()}
                      alt={`Scan image for ${patientName}`}
                      className="w-full h-full object-contain"
                      style={{ 
                        minWidth: '100%', 
                        minHeight: '100%' 
                      }}
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        console.error('Image failed to load:', displayImage());
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                        (e.target as HTMLImageElement).classList.add('object-contain', 'p-4', 'bg-gray-50');
                        setImageLoaded(true);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2 text-sm">
                <h4 className="font-medium mb-2">About This View</h4>
                <p className="text-gray-600">
                  {displayMode === 'original' 
                    ? "Original unprocessed image without any enhancements."
                    : displayMode === 'processed'
                    ? "Enhanced medical scan with greenish coloration" + (isCancer ? " and highlighted regions of potential cancer." : ".")
                    : "Heatmap visualization showing areas of concern with intensity corresponding to confidence levels."
                  }
                </p>
                {isCancer && displayMode !== 'original' && (
                  <p className="text-red-600 mt-2 font-medium">
                    {detectedRegions.length} potential cancer {detectedRegions.length === 1 ? 'region' : 'regions'} detected
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis" className="mt-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Analysis Summary</h3>
                <p className="mt-2 text-gray-700">{analysis?.summary || "Analysis not available."}</p>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900">Key Findings</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {analysis?.findings.map((finding, index) => (
                    <li key={index} className="text-gray-700">{finding}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900">Clinical Recommendations</h4>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {analysis?.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-1">Important Note</h4>
                <p className="text-sm text-blue-700">
                  This analysis is generated by an AI system and is intended to assist medical professionals.
                  All findings should be verified by a qualified healthcare provider before making clinical decisions.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ScanImageModal;
