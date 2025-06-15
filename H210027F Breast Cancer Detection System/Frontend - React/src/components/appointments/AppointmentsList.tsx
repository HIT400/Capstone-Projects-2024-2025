import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertCircle, 
  Edit, 
  MoreHorizontal, 
  Search, 
  Trash2, 
  XCircle,
  Calendar,
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { appointmentService, Appointment } from '@/services/api';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AppointmentsListProps {
  appointments: Appointment[];
  isLoading: boolean;
  onAddAppointment: () => void;
  onEditAppointment: (appointment: Appointment) => void;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  appointments, 
  isLoading, 
  onAddAppointment,
  onEditAppointment 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter appointments based on search query
  const filteredAppointments = appointments.filter(appointment => {
    const searchLower = searchQuery.toLowerCase();
    return (
      appointment.patientName.toLowerCase().includes(searchLower) ||
      appointment.notes.toLowerCase().includes(searchLower) ||
      appointment.status.toLowerCase().includes(searchLower) ||
      appointment.appointmentType.toLowerCase().includes(searchLower) ||
      formatDate(appointment.date).toLowerCase().includes(searchLower)
    );
  });
  
  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Handle cancel appointment
  const handleCancelAppointment = () => {
    // In a real app, this would call an API to cancel the appointment
    console.log('Cancelling appointment:', selectedAppointment);
    setShowCancelDialog(false);
    setSelectedAppointment(null);
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
          icon: <Calendar className="h-4 w-4 text-gray-600" />,
          label: 'General',
          color: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };
  
  // Animation variants
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>Appointments List</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search appointments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
          ) : filteredAppointments.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment, index) => (
                    <React.Fragment key={appointment.id}>
                      <motion.tr
                        className={cn(
                          "cursor-pointer hover:bg-gray-50 transition-colors",
                          expandedRow === appointment.id && "bg-blue-50"
                        )}
                        onClick={() => setExpandedRow(expandedRow === appointment.id ? null : appointment.id)}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={rowVariants}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.6)" }}
                      >
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                            {formatDate(appointment.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-400" />
                            {formatTime(appointment.date)}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{appointment.patientName}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className={cn('border', getStatusColor(appointment.status))}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                            <Badge variant="outline" className={cn('border', getAppointmentTypeInfo(appointment.appointmentType).color)}>
                              <span className="flex items-center gap-1">
                                {getAppointmentTypeInfo(appointment.appointmentType).icon}
                                {getAppointmentTypeInfo(appointment.appointmentType).label}
                              </span>
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{appointment.notes}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setExpandedRow(expandedRow === appointment.id ? null : appointment.id);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEditAppointment(appointment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setSelectedAppointment(appointment);
                                  setShowCancelDialog(true);
                                }}
                              >
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                      {expandedRow === appointment.id && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={6} className="p-4">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                                  <ul className="space-y-2 text-sm">
                                    <li className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-gray-700">Date: {formatDate(appointment.date)}</span>
                                    </li>
                                    <li className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-gray-700">Time: {formatTime(appointment.date)}</span>
                                    </li>
                                    <li className="flex items-center">
                                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="text-gray-700">Duration: {appointment.duration} minutes</span>
                                    </li>
                                    <li className="flex items-center">
                                      {getAppointmentTypeInfo(appointment.appointmentType).icon}
                                      <span className="text-gray-700 ml-2">
                                        Type: {getAppointmentTypeInfo(appointment.appointmentType).label}
                                      </span>
                                    </li>
                                    <li className="flex items-center">
                                      <span className="text-xs text-gray-500 mt-1">
                                        Created: {new Date(appointment.createdAt).toLocaleString()}
                                      </span>
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Clinical Notes</h4>
                                  <p className="text-sm text-gray-700">{appointment.notes}</p>
                                  {appointment.appointmentType === 'oncology_referral' && (
                                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                      <div className="flex items-center">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        <span className="font-medium">Priority: High</span>
                                      </div>
                                      <p className="mt-1">Expedited oncology referral required based on scan analysis.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    console.log('Edit appointment:', appointment);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowCancelDialog(true);
                                  }}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-300 mb-2" />
              <h3 className="text-lg font-medium text-gray-500">No appointments found</h3>
              <p className="text-gray-400 mb-4">
                {searchQuery 
                  ? `No appointments match "${searchQuery}"` 
                  : 'There are no appointments scheduled'}
              </p>
              <Button onClick={onAddAppointment}>
                Schedule New Appointment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Cancel Appointment Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <XCircle className="h-5 w-5 mr-2" /> Cancel Appointment
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppointment && (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="font-medium">{selectedAppointment.patientName}</p>
              <p className="text-sm text-gray-600">
                {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.date)}
              </p>
              <p className="text-sm text-gray-600 mt-1">{selectedAppointment.notes}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelAppointment}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsList;
