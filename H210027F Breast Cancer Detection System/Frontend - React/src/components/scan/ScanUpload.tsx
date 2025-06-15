
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { scanService } from '@/services/api';
import { mlService } from '@/services/mlService';
import { toast } from 'sonner';
import { UploadCloud, X, Image, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import CardOverlay from '../ui/CardOverlay';
import { fileToDataURL, storeImage } from '@/utils/localImageStorage';
import ScanProcessingAnimation from './ScanProcessingAnimation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const uploadSchema = z.object({
  patient_name: z.string().min(2, { message: 'Patient name is required' }),
  patient_age: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: 'Age must be a positive number',
  }),
  patient_gender: z.string().min(1, { message: 'Gender is required' }),
  file: z.any()
    .refine((files) => files?.length === 1, 'Image is required')
    .refine(
      (files) => files?.[0]?.type.startsWith('image/'),
      'File must be an image'
    ),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface ScanUploadProps {
  onUploadSuccess: (result: any) => void;
}

const ScanUpload: React.FC<ScanUploadProps> = ({ onUploadSuccess }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Advanced ML options
  const [generateHeatmap, setGenerateHeatmap] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [includeExplanations, setIncludeExplanations] = useState(true);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      patient_name: '',
      patient_age: '',
      patient_gender: '',
    },
  });

  const fileWatch = watch('file');

  React.useEffect(() => {
    if (fileWatch && fileWatch.length > 0) {
      const file = fileWatch[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }, [fileWatch]);

  const onSubmit = async (data: UploadFormValues) => {
    setIsSubmitting(true);
    setIsProcessing(true);
    
    try {
      // First, store the image locally
      const file = data.file[0];
      const imageDataUrl = await fileToDataURL(file);
      const localId = `scan_${Date.now()}`;
      await storeImage(localId, imageDataUrl);
      
      // Log the form data for debugging
      console.log('Form data being submitted:', {
        patient_name: data.patient_name,
        patient_age: data.patient_age,
        patient_gender: data.patient_gender
      });
      
      // Now submit to the backend for classification with advanced options
      const formData = new FormData();
      formData.append('patient_name', data.patient_name);
      formData.append('patient_age', data.patient_age);
      formData.append('patient_gender', data.patient_gender);
      formData.append('file', data.file[0]);
      
      let result;
      
      // Use advanced ML service if available
      try {
        result = await mlService.predictWithOptions(formData, {
          generateHeatmap,
          confidenceThreshold,
          includeExplanations
        });
        toast.success('Advanced scan analysis complete');
      } catch (mlError) {
        console.warn('Advanced ML service unavailable, falling back to basic prediction', mlError);
        // Fallback to basic prediction if advanced ML service is unavailable
        result = await scanService.predict(formData);
        toast.success('Scan analysis complete');
      }
      
      // Add the local image ID to the result
      result.localImageId = localId;
      
      // Ensure patient data is properly structured
      if (!result.patient || typeof result.patient !== 'object') {
        // Create patient object if it doesn't exist
        result.patient = {
          name: data.patient_name,
          age: parseInt(data.patient_age),
          gender: data.patient_gender
        };
      }
      
      // Also add direct patient properties for components that might use them
      result.patient_name = data.patient_name;
      result.patient_age = data.patient_age;
      result.patient_gender = data.patient_gender;
      
      // Log the result to help with debugging
      console.log('Processed scan result:', result);
      
      // Generate appointment based on result
      try {
        const appointmentResult = await scanService.createAppointmentFromScan(result);
        if (appointmentResult) {
          const appointmentType = result.result === 'Cancer' ? 'oncology referral' : '6-month follow-up';
          toast.success(`${appointmentType} appointment automatically scheduled`);
        }
      } catch (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
      }
      
      setIsProcessing(false);
      onUploadSuccess(result);
      reset();
      setPreview(null);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Error analyzing scan');
      setIsProcessing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setValue('file', e.dataTransfer.files);
    }
  };

  const clearImage = () => {
    setValue('file', null);
    setPreview(null);
  };

  return (
    <CardOverlay className="h-full">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Upload Breast Scan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload a patient's breast scan for classification
          </p>
        </div>

        {isProcessing ? (
          <ScanProcessingAnimation imageUrl={preview || ''} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Collapsible
              open={showAdvancedOptions}
              onOpenChange={setShowAdvancedOptions}
              className="w-full space-y-2 border rounded-md p-2 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-gray-500" />
                  <h4 className="text-sm font-medium">Advanced ML Options</h4>
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-9 p-0">
                    {showAdvancedOptions ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle</span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="generateHeatmap" className="text-sm">Generate Heatmap</Label>
                  <Switch
                    id="generateHeatmap"
                    checked={generateHeatmap}
                    onCheckedChange={setGenerateHeatmap}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="confidenceThreshold" className="text-sm">Confidence Threshold</Label>
                    <span className="text-xs text-gray-500">{(confidenceThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    id="confidenceThreshold"
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeExplanations" className="text-sm">Include Medical Explanations</Label>
                  <Switch
                    id="includeExplanations"
                    checked={includeExplanations}
                    onCheckedChange={setIncludeExplanations}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="patient_name">Patient Name</Label>
                <Input
                  id="patient_name"
                  placeholder="Full name"
                  {...register('patient_name')}
                  className={errors.patient_name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.patient_name && (
                  <p className="text-xs text-red-500">{errors.patient_name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="patient_age">Patient Age</Label>
                <Input
                  id="patient_age"
                  type="number"
                  placeholder="Age"
                  {...register('patient_age')}
                  className={errors.patient_age ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                  min="1"
                />
                {errors.patient_age && (
                  <p className="text-xs text-red-500">{errors.patient_age.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient_gender">Patient Gender</Label>
              <Select 
                onValueChange={(value) => setValue('patient_gender', value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.patient_gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.patient_gender && (
                <p className="text-xs text-red-500">{errors.patient_gender.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Scan Image</Label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                } ${errors.file ? 'border-red-500' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  {...register('file')}
                  disabled={isSubmitting}
                />
                
                {preview ? (
                  <div className="relative w-full">
                    <div className="absolute top-0 right-0 p-1">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearImage();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <img
                      src={preview}
                      alt="Scan preview"
                      className="mx-auto max-h-64 rounded-md object-contain transition-all"
                    />
                    <p className="text-xs text-center mt-2 text-gray-500">
                      Click to change image
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2 py-4">
                    {isDragging ? (
                      <UploadCloud className="h-10 w-10 text-primary animate-pulse" />
                    ) : (
                      <Image className="h-10 w-10 text-gray-400" />
                    )}
                    <div className="flex flex-col items-center">
                      <p className="text-sm font-medium text-gray-700">
                        {isDragging ? 'Drop image here' : 'Drag & drop scan image here'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports: JPG, PNG, JPEG
                    </p>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="text-xs text-red-500">{errors.file.message?.toString()}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !preview}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing scan...
                </div>
              ) : (
                <div className="flex items-center">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Analyze Scan
                </div>
              )}
            </Button>
          </form>
        )}
      </div>
    </CardOverlay>
  );
};

export default ScanUpload;
