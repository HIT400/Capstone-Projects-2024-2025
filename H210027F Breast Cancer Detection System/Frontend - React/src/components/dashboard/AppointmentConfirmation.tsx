
import React, { useState } from 'react';
import { Calendar, ClockIcon, CalendarCheck, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, addMonths, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AppointmentConfirmationProps {
  isCancer: boolean;
  patientName: string;
  patientAge: number;
  patientGender: string;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({ 
  isCancer, 
  patientName, 
  patientAge,
  patientGender 
}) => {
  const { toast } = useToast();
  const today = new Date();
  
  // Default appointment date: 3 days from now for cancer, 6 months for non-cancer
  const defaultDate = isCancer ? addDays(today, 3) : addMonths(today, 6);
  const [appointmentDate, setAppointmentDate] = useState(defaultDate);
  
  // Doctor notes
  const [notes, setNotes] = useState('');
  
  const handleConfirmAppointment = () => {
    toast({
      title: "Appointment Scheduled",
      description: `Follow-up appointment for ${patientName} on ${format(appointmentDate, 'MMMM d, yyyy')}`,
    });
  };
  
  const handleReschedule = (days: number) => {
    const newDate = addDays(appointmentDate, days);
    setAppointmentDate(newDate);
    toast({
      title: "Appointment Rescheduled",
      description: `New appointment date: ${format(newDate, 'MMMM d, yyyy')}`,
    });
  };

  return (
    <Card className="animate-fade-in mt-6">
      <CardHeader className={isCancer ? "bg-red-50" : "bg-green-50"}>
        <div className="flex items-center gap-2">
          {isCancer 
            ? <AlertCircle className="text-red-600 h-5 w-5" /> 
            : <CalendarCheck className="text-green-600 h-5 w-5" />
          }
          <CardTitle className={isCancer ? "text-red-700" : "text-green-700"}>
            {isCancer ? "Urgent Follow-Up Required" : "Routine Follow-Up Recommended"}
          </CardTitle>
        </div>
        <CardDescription>
          {isCancer 
            ? "High priority appointment has been automatically scheduled" 
            : "Regular monitoring appointment has been created"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <h4 className="font-medium">Appointment Details</h4>
              <p className="text-gray-600">
                {format(appointmentDate, 'EEEE, MMMM d, yyyy')}
              </p>
              {isCancer && (
                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md">
                  <p className="text-sm text-red-700 font-medium">Contact within {isCancer ? '3 days' : '6 months'}</p>
                </div>
              )}
            </div>
          </div>
          
          {isCancer && (
            <>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <ClockIcon className="h-5 w-5 text-blue-700" />
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Recommended Tests</h4>
                <ul className="list-disc pl-5 space-y-1 text-gray-600">
                  <li>Tissue biopsy to confirm diagnosis</li>
                  <li>Additional MRI scan for clearer imaging</li>
                  <li>Blood tests for tumor markers</li>
                </ul>
              </div>
            </>
          )}
          
          {!isCancer && (
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <Info className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <h4 className="font-medium">Monitoring Recommendation</h4>
                <p className="text-gray-600">
                  No signs of cancer detected, but regular monitoring is essential.
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Self-Examination Tips</h5>
                  <ul className="list-disc pl-5 text-sm text-blue-700">
                    <li>Perform self-exams once a month</li>
                    <li>Look for changes in size or shape</li>
                    <li>Note any unusual lumps or skin changes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 border-t pt-4">
        <Button 
          onClick={handleConfirmAppointment}
          className={isCancer ? "bg-red-600 hover:bg-red-700" : ""}
        >
          Confirm Appointment
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleReschedule(-1)}
          >
            Earlier
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleReschedule(1)}
          >
            Later
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AppointmentConfirmation;
