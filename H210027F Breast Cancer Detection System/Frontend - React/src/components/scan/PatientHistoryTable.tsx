import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scanService } from '@/services/api';
import { toast } from 'sonner';
import { Search, Filter, ArrowUpDown, Calendar, FileImage, FileText } from 'lucide-react';
import CardOverlay from '../ui/CardOverlay';
import { cn } from '@/lib/utils';
import ScanImageModal from './ScanImageModal';

const searchSchema = z.object({
  patient_name: z.string().optional(),
  patient_gender: z.string().optional(),
  result: z.string().optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface PatientHistoryItem {
  id: number;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  result: string;
  confidence: number;
  created_at: string;
  image_path: string;
  doctor: string;
}

interface PatientHistoryTableProps {
  initialHistory?: PatientHistoryItem[];
}

const PatientHistoryTable: React.FC<PatientHistoryTableProps> = ({ initialHistory = [] }) => {
  const [history, setHistory] = useState<PatientHistoryItem[]>(initialHistory);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ 
    path: string; 
    patientName: string; 
    result: string;
    confidence: number;
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      patient_name: '',
      patient_gender: '',
      result: '',
    },
  });

  const loadHistory = async (filters: SearchFormValues = {}) => {
    setIsLoading(true);
    try {
      const response = await scanService.getHistory(filters);
      setHistory(response.history);
    } catch (error: any) {
      console.error('Error fetching history:', error);
      toast.error(error.response?.data?.detail || 'Failed to load patient history');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadHistory();
  }, []);

  const onSubmit = async (data: SearchFormValues) => {
    // Remove empty string values
    const filters = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== '')
    );
    
    await loadHistory(filters);
  };

  const resetFilters = () => {
    reset();
    loadHistory();
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
    
    const sortedHistory = [...history].sort((a, b) => {
      if (a[key as keyof PatientHistoryItem] < b[key as keyof PatientHistoryItem]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key as keyof PatientHistoryItem] > b[key as keyof PatientHistoryItem]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setHistory(sortedHistory);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openImageModal = (imagePath: string, patientName: string, result: string, confidence: number) => {
    setSelectedImage({ 
      path: imagePath, 
      patientName,
      result,
      confidence
    });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <CardOverlay className="h-full">
      <div className="space-y-6">

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          </div>
        </form>

        <div className="relative overflow-x-auto mt-4 border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs uppercase bg-gray-50 text-gray-700">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('patient_name')}
                >
                  <div className="flex items-center">
                    Patient
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">
                  Age/Gender
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('created_at')}
                >
                  <div className="flex items-center">
                    Date
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => requestSort('result')}
                >
                  <div className="flex items-center">
                    Result
                    <ArrowUpDown className="ml-1 h-4 w-4" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">
                  Confidence
                </th>
                <th scope="col" className="px-6 py-3">
                </th>
                <th scope="col" className="px-6 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr className="bg-white border-b">
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    {isLoading ? (
                      <div className="flex justify-center items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading patient history...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <FileText className="h-8 w-8 text-gray-400" />
                        <span>No patient records found</span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr 
                    key={item.id} 
                    className="bg-white border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      #{item.id}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {item.patient_name}
                    </td>
                    <td className="px-6 py-4">
                      {item.patient_age} / {item.patient_gender}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(item.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-medium",
                        item.result === "Malignant" 
                          ? "bg-red-100 text-red-800" 
                          : "bg-green-100 text-green-800"
                      )}>
                        {item.result}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td className="px-6 py-4">
                      {item.doctor}
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => openImageModal(
                          item.image_path, 
                          item.patient_name, 
                          item.result, 
                          item.confidence
                        )}
                        title="View Scan Image"
                      >
                        <FileImage className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedImage && (
        <ScanImageModal
          isOpen={!!selectedImage}
          onClose={closeImageModal}
          imagePath={selectedImage.path}
          patientName={selectedImage.patientName}
          result={{
            result: selectedImage.result,
            confidence: selectedImage.confidence,
            localImageId: null // We don't have local image ID in the history view
          }}
        />
      )}
    </CardOverlay>
  );
};

export default PatientHistoryTable;
