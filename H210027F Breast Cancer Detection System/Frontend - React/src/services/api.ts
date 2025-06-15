
import axios from 'axios';

// Create axios instance with base URL and default headers
const API_URL = 'http://localhost:8000'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to get full image URL
export const getImageUrl = (imagePath: string) => {
  // Log the path being processed to help with debugging
  console.log('Processing image path:', imagePath);
  
  // If the path is empty, null, or undefined, return placeholder
  if (!imagePath) {
    console.log('Empty path, returning placeholder');
    return '/placeholder.svg';
  }
  
  // If the image path is already a full URL, return it as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Path is already a full URL');
    return imagePath;
  }
  
  // If the path starts with a slash, join it with the API URL
  if (imagePath.startsWith('/')) {
    console.log(`Converting ${imagePath} to full URL with API base`);
    return `${API_URL}${imagePath}`;
  }
  
  // If the path doesn't start with a slash, add one
  console.log(`Converting ${imagePath} to full URL with slash added`);
  return `${API_URL}/${imagePath}`;
};

// Authentication services
export const authService = {
  // Register a new doctor
  register: async (doctorData: any) => {
    const response = await api.post('/register', doctorData);
    return response.data;
  },

  // Login a doctor
  login: async (credentials: { username: string; password: string }) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    
    return response.data;
  },

  // Logout the current doctor
  logout: () => {
    localStorage.removeItem('access_token');
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

// Scan services
export const scanService = {
  // Upload a scan and get prediction
  predict: async (formData: FormData) => {
    const response = await api.post('/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get patient history with optional filters
  getHistory: async (filters = {}) => {
    const response = await api.post('/history', filters);
    
    // Process image paths to convert relative paths to full URLs
    if (response.data.history) {
      response.data.history = response.data.history.map((item: any) => ({
        ...item,
        image_path: getImageUrl(item.image_path),
      }));
      
      // Log the processed history for debugging
      console.log('Processed history with image paths:', response.data.history);
    }
    
    return response.data;
  },
  
  // Create an appointment from scan result
  createAppointmentFromScan: async (scanResult: any) => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate creating an appointment
      console.log('Creating appointment from scan result:', scanResult);
      
      const isMalignant = scanResult.result === 'Cancer' || scanResult.result === 'Malignant';
      const today = new Date();
      
      // Set appointment date based on result
      const appointmentDate = new Date(today);
      if (isMalignant) {
        appointmentDate.setDate(today.getDate() + 3); // 3 days from now for oncology
      } else {
        appointmentDate.setMonth(today.getMonth() + 6); // 6 months from now for follow-up
      }
      
      // Set appointment time at 10am or 2pm
      appointmentDate.setHours(isMalignant ? 10 : 14);
      appointmentDate.setMinutes(0);
      
      // Create appointment object
      const appointment = {
        id: `appt-${scanResult.id || Date.now()}`,
        patientName: scanResult.patient?.name || scanResult.patient_name || 'Unknown Patient',
        patientId: scanResult.patient?.id || `patient-${Date.now()}`,
        date: appointmentDate,
        status: 'confirmed',
        notes: isMalignant 
          ? 'Immediate oncology referral following malignant classification' 
          : 'Scheduled 6-month surveillance follow-up',
        duration: isMalignant ? 60 : 30,
        appointmentType: isMalignant ? 'oncology_referral' : 'follow_up',
        scanId: scanResult.id,
        createdAt: new Date()
      };
      
      // In a real app, this would call an API endpoint to save the appointment
      console.log('Created new appointment:', appointment);
      
      return appointment;
    } catch (error) {
      console.error('Error creating appointment from scan:', error);
      return null;
    }
  },
};

// Get patient history for analysis
export const getPatientHistory = async (): Promise<any[]> => {
  try {
    const response = await scanService.getHistory();
    
    // Map the history data to the format expected by the frontend
    const mappedHistory = (response.history || []).map((item: any) => {
      // Create a properly structured patient object
      const patient = {
        name: item.patient_name || item.patientName || 'Unknown Patient',
        age: parseInt(item.patient_age || item.patientAge || '0'),
        gender: item.patient_gender || item.patientGender || 'Unknown'
      };

      // Create a properly structured result object
      return {
        id: item.id,
        result: item.result === 'Malignant' ? 'Cancer' : (item.result === 'Benign' ? 'Non-Cancer' : item.result),
        confidence: item.confidence,
        date: item.created_at || item.date || new Date().toISOString(),
        image_path: item.image_path,
        doctor: item.doctor,
        patient: patient,
        // Keep the original fields as well for backward compatibility
        patient_name: item.patient_name,
        patient_age: item.patient_age,
        patient_gender: item.patient_gender
      };
    });
    
    console.log('Mapped patient history:', mappedHistory);
    return mappedHistory;
  } catch (error) {
    console.error('Error fetching patient history:', error);
    return [];
  }
};

// Get analysis statistics from backend
export const getAnalysisStatistics = async () => {
  try {
    // Make a direct request to the FastAPI backend for statistics
    const response = await api.get('/statistics');
    console.log('Analysis statistics from backend:', response.data);
    
    // If we have patient data, process it to ensure gender is correctly extracted
    if (response.data && response.data.patientData && Array.isArray(response.data.patientData)) {
      // Process each patient to extract gender from name/info if needed
      response.data.patientData = response.data.patientData.map((patient: any) => {
        if (!patient) return patient;
        
        // Try to extract gender from patient name/info if gender is not set
        if ((!patient.gender || patient.gender === 'unknown') && patient.name) {
          const patientInfo = patient.name.toString();
          const ageGenderMatch = patientInfo.match(/\d+\s*\/\s*([a-zA-Z]+)/);
          
          if (ageGenderMatch && ageGenderMatch[1]) {
            const extractedGender = ageGenderMatch[1].toLowerCase().trim();
            
            // Normalize gender values
            if (extractedGender === 'female' || extractedGender === 'f') {
              patient.gender = 'female';
            } else if (extractedGender === 'male' || extractedGender === 'm') {
              patient.gender = 'male';
            }
            
            // Also try to extract age if not already set
            if (!patient.age) {
              const ageMatch = patientInfo.match(/(\d+)\s*\//);
              if (ageMatch && ageMatch[1]) {
                patient.age = parseInt(ageMatch[1], 10);
              }
            }
          }
        } else if (patient.gender) {
          // Normalize existing gender values
          const gender = patient.gender.toString().toLowerCase().trim();
          if (gender === 'female' || gender === 'f') {
            patient.gender = 'female';
          } else if (gender === 'male' || gender === 'm') {
            patient.gender = 'male';
          }
        }
        
        return patient;
      });
      
      // Recalculate gender statistics if needed
      if (response.data.genderData) {
        const maleCount = response.data.patientData.filter((p: any) => p && p.gender === 'male').length;
        const femaleCount = response.data.patientData.filter((p: any) => p && p.gender === 'female').length;
        const totalWithGender = maleCount + femaleCount;
        
        if (totalWithGender > 0) {
          response.data.malePercentage = Math.round((maleCount / totalWithGender) * 100);
          response.data.femalePercentage = Math.round((femaleCount / totalWithGender) * 100);
          
          // Update gender data for charts
          response.data.genderData = [
            { name: 'Male', value: maleCount },
            { name: 'Female', value: femaleCount }
          ];
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching analysis statistics:', error);
    // If the backend endpoint fails, return null so we can fall back to client-side calculation
    return null;
  }
};

// Appointment types
export interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  date: Date;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string;
  duration: number;
  appointmentType: 'oncology_referral' | 'follow_up';
  scanId?: string;
  createdAt: Date;
}

// Appointment services
export const appointmentService = {
  // Get all appointments
  getAppointments: async (): Promise<Appointment[]> => {
    try {
      // In a real app, this would call an API endpoint
      // For now, we'll get real scan results and create appointments only for those
      const patientHistory = await getPatientHistory();
      
      if (!patientHistory.length) return [];
      
      // Filter out scans that have valid data
      const validScans = patientHistory.filter(scan => {
        // Only include scans that have a valid result and patient information
        return (
          scan && 
          scan.result && 
          (scan.result === 'Cancer' || scan.result === 'Non-Cancer' || 
           scan.result === 'Malignant' || scan.result === 'Benign') &&
          scan.patient && 
          scan.patient.name && 
          scan.patient.name.trim() !== ''
        );
      });
      
      // Generate appointments based on valid scan results only
      return validScans.map(scan => {
        const isMalignant = scan.result === 'Cancer' || scan.result === 'Malignant';
        const scanDate = scan.date ? new Date(scan.date) : new Date();
        
        // Set appointment date based on result
        // Oncology referral: within 1 week of scan date
        // Follow-up: in 6 months from scan date
        const appointmentDate = new Date(scanDate);
        if (isMalignant) {
          appointmentDate.setDate(scanDate.getDate() + 3); // 3 days after scan for oncology
        } else {
          appointmentDate.setMonth(scanDate.getMonth() + 6); // 6 months after scan for follow-up
        }
        
        // Set appointment time at 10am for oncology or 2pm for follow-up
        appointmentDate.setHours(isMalignant ? 10 : 14);
        appointmentDate.setMinutes(0);
        
        return {
          id: `appt-${scan.id}`,
          patientName: scan.patient.name,
          patientId: scan.patient.id || `patient-${scan.id}`,
          date: appointmentDate,
          status: 'confirmed',
          notes: isMalignant 
            ? 'Immediate oncology referral following malignant classification' 
            : 'Scheduled 6-month surveillance follow-up',
          duration: isMalignant ? 60 : 30, // Oncology referrals need more time
          appointmentType: isMalignant ? 'oncology_referral' : 'follow_up',
          scanId: scan.id,
          createdAt: new Date(scan.date || Date.now())
        };
      });
    } catch (error) {
      console.error('Error generating appointments:', error);
      return [];
    }
  },
  
  // Create a new appointment based on scan result
  createAppointmentFromScan: async (scanResult: any): Promise<Appointment | null> => {
    try {
      // Validate that we have a proper scan result with patient information
      if (!scanResult || !scanResult.result || !scanResult.patient || !scanResult.patient.name) {
        console.error('Invalid scan result data for appointment creation');
        return null;
      }
      
      const isMalignant = scanResult.result === 'Cancer' || scanResult.result === 'Malignant';
      const scanDate = scanResult.date ? new Date(scanResult.date) : new Date();
      
      // Set appointment date based on result
      const appointmentDate = new Date(scanDate);
      if (isMalignant) {
        appointmentDate.setDate(scanDate.getDate() + 3); // 3 days after scan for oncology
      } else {
        appointmentDate.setMonth(scanDate.getMonth() + 6); // 6 months after scan for follow-up
      }
      
      // Set appointment time at 10am or 2pm
      appointmentDate.setHours(isMalignant ? 10 : 14);
      appointmentDate.setMinutes(0);
      
      const newAppointment: Appointment = {
        id: `appt-${scanResult.id || Date.now()}`,
        patientName: scanResult.patient.name,
        patientId: scanResult.patient.id || `patient-${Date.now()}`,
        date: appointmentDate,
        status: 'confirmed',
        notes: isMalignant 
          ? 'Immediate oncology referral following malignant classification' 
          : 'Scheduled 6-month surveillance follow-up',
        duration: isMalignant ? 60 : 30,
        appointmentType: isMalignant ? 'oncology_referral' : 'follow_up',
        scanId: scanResult.id,
        createdAt: new Date(scanResult.date || Date.now())
      };
      
      // In a real app, this would call an API endpoint to save the appointment
      console.log('Created new appointment from scan:', newAppointment);
      
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment from scan:', error);
      return null;
    }
  }
};

export default api;
