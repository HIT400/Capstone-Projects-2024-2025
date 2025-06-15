import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AppointmentsCalendar from '@/components/appointments/AppointmentsCalendar';
import AppointmentsList from '@/components/appointments/AppointmentsList';
import AppointmentModal from '@/components/appointments/AppointmentModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar as CalendarIcon, List } from 'lucide-react';
import { motion } from 'framer-motion';
import { appointmentService, Appointment } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

const Appointments = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [showAddModal, setShowAddModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        const data = await appointmentService.getAppointments();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast({
          title: 'Error',
          description: 'Failed to load appointments. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingAppointments(false);
      }
    };
    
    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated, toast]);
  
  // Handle appointment creation/update success
  const handleAppointmentSuccess = (appointment: Appointment) => {
    // Check if this is an update or a new appointment
    const isUpdate = appointments.some(a => a.id === appointment.id);
    
    if (isUpdate) {
      // Update existing appointment
      setAppointments(prev => 
        prev.map(a => a.id === appointment.id ? appointment : a)
      );
    } else {
      // Add new appointment
      setAppointments(prev => [...prev, appointment]);
    }
    
    // Reset selected appointment
    setSelectedAppointment(null);
  };
  
  // Handle edit appointment
  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowAddModal(true);
  };
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout className="py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mt-[50px]">Appointments</h1>
            <p className="text-gray-500 mt-2">
              Schedule and manage patient appointments
            </p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => setShowAddModal(true)} 
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Appointment
            </Button>
          </motion.div>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="calendar" className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center">
              <List className="mr-2 h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-0">
            <AppointmentsCalendar 
              onAddAppointment={() => {
                setSelectedAppointment(null);
                setShowAddModal(true);
              }} 
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <AppointmentsList 
              appointments={appointments}
              isLoading={isLoadingAppointments}
              onAddAppointment={() => {
                setSelectedAppointment(null);
                setShowAddModal(true);
              }}
              onEditAppointment={handleEditAppointment}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleAppointmentSuccess}
        initialData={selectedAppointment || undefined}
      />
    </Layout>
  );
};

export default Appointments;
