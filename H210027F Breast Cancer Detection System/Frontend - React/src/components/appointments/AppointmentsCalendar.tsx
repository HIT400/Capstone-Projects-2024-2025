import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal, AlertCircle, AlertTriangle, Activity, Clock } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appointmentService, Appointment } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AppointmentsCalendarProps {
  onAddAppointment: () => void;
}

const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({ onAddAppointment }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        const data = await appointmentService.getAppointments();
        setAppointments(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointments();
  }, []);
  
  // Get appointments for the selected date
  const getAppointmentsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return (
        appointmentDate.getDate() === date.getDate() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  // Get dates with appointments for the calendar
  const getDatesWithAppointments = () => {
    const dates: Record<string, { count: number, statuses: string[], types: string[] }> = {};
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.date);
      const dateString = date.toISOString().split('T')[0];
      
      if (!dates[dateString]) {
        dates[dateString] = { count: 0, statuses: [], types: [] };
      }
      
      dates[dateString].count += 1;
      if (!dates[dateString].statuses.includes(appointment.status)) {
        dates[dateString].statuses.push(appointment.status);
      }
      if (!dates[dateString].types.includes(appointment.appointmentType)) {
        dates[dateString].types.push(appointment.appointmentType);
      }
    });
    
    return dates;
  };
  
  const datesWithAppointments = getDatesWithAppointments();
  const selectedDayAppointments = getAppointmentsForDate(selectedDay || date);
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get appointment type icon and color
  const getAppointmentTypeInfo = (type: string) => {
    switch (type) {
      case 'oncology_referral':
        return {
          icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
          label: 'Oncology Referral',
          color: 'bg-red-50 text-red-700 border-red-200'
        };
      case 'follow_up':
        return {
          icon: <Activity className="h-4 w-4 text-blue-600" />,
          label: 'Follow-Up',
          color: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-600" />,
          label: 'General',
          color: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  // Handle day selection
  const handleDaySelect = (day: Date | undefined) => {
    setDate(day);
    setSelectedDay(day || null);
    if (day) {
      setViewMode('day');
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>
              {viewMode === 'month' ? 'Calendar View' : formatDate(selectedDay || new Date())}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {viewMode === 'day' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode('month')}
                >
                  Back to Calendar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8 text-red-500">
              <AlertCircle className="mr-2 h-5 w-5" />
              <p>{error}</p>
            </div>
          ) : viewMode === 'month' ? (
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDaySelect}
              className="rounded-md border"
              modifiers={{
                hasAppointment: (date) => {
                  const dateString = date.toISOString().split('T')[0];
                  return !!datesWithAppointments[dateString];
                }
              }}
              modifiersClassNames={{
                hasAppointment: 'bg-blue-50 font-bold text-blue-700 relative'
              }}
              components={{
                DayContent: ({ date }) => {
                  const dateString = date.toISOString().split('T')[0];
                  const appointmentData = datesWithAppointments[dateString];
                  
                  return (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {date.getDate()}
                      {appointmentData && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                          {appointmentData.types.includes('oncology_referral') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                          )}
                          {appointmentData.types.includes('follow_up') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              }}
            />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {selectedDayAppointments.length > 0 ? (
                selectedDayAppointments.map((appointment, index) => {
                  const appointmentTime = new Date(appointment.date);
                  const typeInfo = getAppointmentTypeInfo(appointment.appointmentType);
                  
                  return (
                    <motion.div
                      key={appointment.id}
                      variants={itemVariants}
                      className={cn(
                        "p-4 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4",
                        typeInfo.color
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {typeInfo.icon}
                          <span className="font-medium">{typeInfo.label}</span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Badge>
                        </div>
                        <h4 className="font-semibold">{appointment.patientName}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(appointmentTime)} • {appointment.duration} min
                          </span>
                        </div>
                        {appointment.notes && (
                          <p className="text-sm mt-2">{appointment.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No appointments scheduled for this day.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={onAddAppointment}
                  >
                    Schedule New Appointment
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppointmentsCalendar;
