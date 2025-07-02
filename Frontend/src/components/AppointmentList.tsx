import React, { useState } from "react";
import { Calendar, Clock, User, Stethoscope } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import appointmentService from "@/services/appointmentService";

interface Appointment {
  _id: string;
  patientName: string;
  specialization: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

interface AppointmentListProps {
  appointments: Appointment[];
  onReschedule: (id: string) => void;
  onJoinCall: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onReschedule,
  onJoinCall,
  onDelete,
  onUpdate
}) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleJoinCall = (id: string) => {
    const roomName = `CureLink_${id}`;
    window.open(`https://meet.jit.si/${roomName}`, "_blank");
    onJoinCall(id);
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await appointmentService.deleteAppointment(id);
      // onDelete(id);   // Parent should remove the appointment from its state
      onUpdate();     
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: "Error",
        description: "Failed to delete appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {appointments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="bg-white rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{appointment.patientName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{appointment.specialization}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{appointment.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{appointment.time}</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  appointment.status.toLowerCase() === 'confirmed' 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {appointment.status}
                </span>

                <button
                  onClick={() => handleDelete(appointment._id)}
                  className="text-red-500 hover:text-red-600"
                  disabled={deletingId === appointment._id}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            </div>

            {appointment.status.toLowerCase() === 'upcoming' && (
              <div className="mt-4 flex gap-2">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => onReschedule(appointment._id)}
                >
                  Reschedule
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleJoinCall(appointment._id)}
                >
                  Join Call
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default AppointmentList;