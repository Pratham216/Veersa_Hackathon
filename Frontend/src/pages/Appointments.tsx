import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import BookAppointment from "@/components/BookAppointment";
import AppointmentList from "@/components/AppointmentList";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import appointmentService, { Appointment } from "@/services/appointmentService";
import doctorService, { Doctor } from "@/services/doctorService";

const Appointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showBook, setShowBook] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [showBook]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Automatically show booking form when a doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      setShowBook(true);
    }
  }, [selectedDoctor]);

  const handleReschedule = (id: string) => {
    setRescheduleId(id);
    setShowBook(true);
  };

  const handleJoinCall = (id: string) => {
    // No alert, just rely on Jitsi open in AppointmentList
  };

  const handleDelete = async (id: string) => {
    try {
      await appointmentService.deleteAppointment(id);
      toast({
        title: "Success",
        description: "Appointment deleted successfully"
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error deleting appointment:", error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive"
      });
    }
  };

  const handleCloseBooking = () => {
    setShowBook(false);
    setRescheduleId(null);
    setSelectedDoctor(null);
  };

  // Map appointments to the format expected by AppointmentList
  const mappedAppointments = appointments.map(appointment => {
    // Convert date string to Date object for comparison
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    // Determine if the appointment is upcoming
    const isUpcoming = appointmentDate >= today;

    return {
      _id: appointment._id,
      patientName: appointment.patientName,
      specialization: appointment.specialization,
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      // Set status to 'Upcoming' for future appointments
      status: isUpcoming ? 'Upcoming' : appointment.status
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-700">Appointments</h1>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white" 
            onClick={() => setShowBook(true)}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {showBook ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <BookAppointment
                onClose={handleCloseBooking}
                rescheduleId={rescheduleId}
                initialDoctor={selectedDoctor}
                onRescheduleComplete={fetchAppointments}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <AppointmentList
                  appointments={mappedAppointments}
                  onReschedule={handleReschedule}
                  onJoinCall={handleJoinCall}
                  onDelete={handleDelete}
                  onUpdate={fetchAppointments}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Appointments;
