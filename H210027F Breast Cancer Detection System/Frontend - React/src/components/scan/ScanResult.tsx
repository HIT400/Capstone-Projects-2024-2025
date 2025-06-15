
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CircleCheck, CircleX, AlertCircle, User, Calendar, HeartPulse, ImagePlus, BarChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import CardOverlay from '../ui/CardOverlay';
import { Button } from '@/components/ui/button';

interface ScanResultProps {
  result: {
    id: number;
    result: string;
    confidence: number;
    patient: {
      name: string;
      age: number;
      gender: string;
    };
    image_path?: string;
  };
  onViewDetailedAnalysis?: () => void;
  onToggleInsights?: () => void;
}

const ScanResult: React.FC<ScanResultProps> = ({ result, onViewDetailedAnalysis, onToggleInsights }) => {
  const isCancer = result.result === 'Cancer';
  const confidencePercent = Math.round(result.confidence * 100);
  
  return (
    <CardOverlay className="h-full">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-sm text-gray-500">
            Breast scan classification results for {result.patient.name}
          </p>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="flex flex-col items-center space-y-3">
            {isCancer ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center"
              >
                <CircleX className="h-10 w-10 text-red-600" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center"
              >
                <CircleCheck className="h-10 w-10 text-green-600" />
              </motion.div>
            )}
            
            <h3 className={`text-2xl font-bold ${isCancer ? 'text-red-600' : 'text-green-600'}`}>
              {isCancer ? 'Cancer' : 'Non-Cancer'}
            </h3>
            
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Confidence</p>
                <p className="text-sm font-medium">{confidencePercent}%</p>
              </div>
              <Progress value={confidencePercent} className={isCancer ? 'bg-red-100' : 'bg-green-100'} />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{result.patient.name}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium text-gray-900">{result.patient.age} years</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-900">{result.patient.gender}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {isCancer && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-600">Important Notice</h4>
              <p className="text-sm text-red-700 mt-1">
                This scan shows signs of cancer with high confidence. We recommend immediate follow-up 
                with additional diagnostic procedures and consultation with an oncology specialist.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Button 
            onClick={onViewDetailedAnalysis} 
            className="w-full md:w-auto"
          >
            <ImagePlus className="mr-2 h-4 w-4" /> 
            View AI-Enhanced Image Analysis
          </Button>
          
        </div>
      </div>
    </CardOverlay>
  );
};

export default ScanResult;
