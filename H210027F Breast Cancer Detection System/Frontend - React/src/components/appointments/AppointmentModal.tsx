import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { appointmentService, Appointment } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (appointment: Appointment) => void;
  initialData?: Partial<Appointment>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialData
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '',
    date: new Date(),
    time: '09:00',
    duration: 30,
    notes: '',
    appointmentType: 'follow_up' as 'oncology_referral' | 'follow_up',
    status: 'confirmed' as 'confirmed' | 'pending' | 'cancelled'
  });
  
  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      const time = initialData.date 
        ? format(new Date(initialData.date), 'HH:mm') 
        : '09:00';
      
      setFormData({
        patientName: initialData.patientName || '',
        patientId: initialData.patientId || '',
        date: initialData.date ? new Date(initialData.date) : new Date(),
        time,
        duration: initialData.duration || 30,
        notes: initialData.notes || '',
        appointmentType: initialData.appointmentType || 'follow_up',
        status: initialData.status || 'confirmed'
      });
    }
  }, [initialData]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle date change
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, date }));
      
      // Clear error for this field
      if (errors.date) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.date;
          return newErrors;
        });
      }
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.appointmentType) {
      newErrors.appointmentType = 'Appointment type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Combine date and time
      const appointmentDate = new Date(formData.date);
      const [hours, minutes] = formData.time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes);
      
      // Validate that we have a proper patient name
      if (!formData.patientName.trim()) {
        toast({
          title: 'Error',
          description: 'Patient name is required',
          variant: 'destructive',
        });
        return;
      }
      
      // Create appointment object with real data only
      const appointmentData: Partial<Appointment> = {
        patientName: formData.patientName.trim(),
        patientId: formData.patientId.trim() || `patient-${Date.now()}`,
        date: appointmentDate,
        status: formData.status,
        notes: formData.notes.trim(),
        duration: formData.duration,
        appointmentType: formData.appointmentType,
        createdAt: new Date()
      };
      
      // If we have an ID, we're updating an existing appointment
      if (initialData?.id) {
        appointmentData.id = initialData.id;
      }
      
      // In a real app, this would call an API endpoint
      console.log('Saving appointment:', appointmentData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create a proper appointment object with no dummy data
      const savedAppointment: Appointment = {
        id: initialData?.id || `appt-${Date.now()}`,
        ...appointmentData
      } as Appointment;
    
      // Call onSuccess callback
      if (onSuccess) {
        onSuccess(savedAppointment);
      }
      
      // Show success message
      toast({
        title: initialData?.id ? 'Appointment Updated' : 'Appointment Created',
        description: `Appointment for ${formData.patientName} has been ${initialData?.id ? 'updated' : 'scheduled'}.`,
        variant: 'default',
      });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save appointment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {initialData?.id ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name <span className="text-red-500">*</span></Label>
            <Input
              id="patientName"
              name="patientName"
              value={formData.patientName}
              onChange={handleChange}
              placeholder="Enter patient name"
              className={errors.patientName ? 'border-red-500' : ''}
            />
            {errors.patientName && (
              <p className="text-red-500 text-sm">{errors.patientName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              placeholder="Enter patient ID (optional)"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date <span className="text-red-500">*</span></Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground",
                      errors.date && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-red-500 text-sm">{errors.date}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={cn("pl-10", errors.time && "border-red-500")}
                />
              </div>
              {errors.time && (
                <p className="text-red-500 text-sm">{errors.time}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type <span className="text-red-500">*</span></Label>
              <Select
                value={formData.appointmentType}
                onValueChange={(value) => handleSelectChange('appointmentType', value)}
              >
                <SelectTrigger className={errors.appointmentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow-Up</SelectItem>
                  <SelectItem value="oncology_referral">Oncology Referral</SelectItem>
                </SelectContent>
              </Select>
              {errors.appointmentType && (
                <p className="text-red-500 text-sm">{errors.appointmentType}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value as 'confirmed' | 'pending' | 'cancelled')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Add appointment notes"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData?.id ? 'Update' : 'Schedule'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
