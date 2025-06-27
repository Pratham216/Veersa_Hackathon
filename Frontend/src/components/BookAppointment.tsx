import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Clock, Search, MapPin, Stethoscope, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import Payment from "./Payment.tsx";
import { motion, AnimatePresence } from "framer-motion";
import doctorService, { Doctor } from "@/services/doctorService";
import appointmentService, { Appointment } from "@/services/appointmentService";
import { useAuth } from "@/contexts/AuthContext";

const BACKEND_URL = 'https://veersa-hackathon-1qjh.onrender.com';

interface BookAppointmentProps {
  rescheduleId?: string | null;
  initialDoctor?: Doctor | null;
  onRescheduleComplete?: () => void;
  onClose?: () => void;
}

const FIXED_TIME_SLOTS = [
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "12:00", "12:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30"
];

const generateTimeSlots = () => {
  return FIXED_TIME_SLOTS;
};

const generateAvailability = () => {
  const availability = [];
  const today = new Date();

  // Generate availability for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    // Skip Sundays (0 is Sunday)
    if (date.getDay() !== 0) {
      availability.push({
        date: format(date, "yyyy-MM-dd"),
        slots: generateTimeSlots()
      });
    }
  }
  return availability;
};

// Function to randomly generate availability status for demonstration
const getRandomAvailability = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  // Only show colors for dates within next 30 days
  if (date < today || date > thirtyDaysFromNow) {
    return "disabled";
  }

  // Generate a random number between 0 and 2
  const random = Math.floor(Math.random() * 3);
  return random === 0 ? "available" : random === 1 ? "partial" : "booked";
};

const BookAppointment: React.FC<BookAppointmentProps> = ({
  rescheduleId,
  initialDoctor,
  onRescheduleComplete,
  onClose
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(initialDoctor || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("find-doctor");
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    email: "",
    reason: "",
    symptoms: ""
  });
  const [showPayment, setShowPayment] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Appointment | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<{ time: string; isBooked: boolean; }[]>([]);
  const [dateAvailability, setDateAvailability] = useState<Record<string, "disabled" | "available" | "booked" | "partial">>({});
  const [formErrors, setFormErrors] = useState({
    doctor: false,
    date: false,
    time: false,
    patientName: false,
    phone: false,
    email: false,
    reason: false
  });

  useEffect(() => {
    fetchDoctors();
    if (rescheduleId) {
      fetchAppointment(rescheduleId);
    }
  }, [rescheduleId]);

  const fetchDoctors = async () => {
    try {
      const data = await doctorService.getAllDoctors();
      // Filter only users with usertype 'doctor'
      const doctorsOnly = data.filter((doc: any) => doc.usertype === "doctor");
      setDoctors(doctorsOnly);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive"
      });
    }
  };

  const fetchAppointment = async (id: string) => {
    try {
      const appointment = await appointmentService.getAppointmentById(id);
      const doctor = doctors.find(d => d.name === appointment.doctorName);
      if (doctor) {
        setSelectedDoctor(doctor);
      }
      setFormData({
        patientName: appointment.patientName,
        phone: appointment.phone,
        email: appointment.email,
        reason: appointment.reason,
        symptoms: appointment.symptoms
      });
      setSelectedDate(new Date(appointment.date));
      setSelectedTime(appointment.time);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment details",
        variant: "destructive"
      });
    }
  };

  const validateForm = () => {
    const errors = {
      doctor: !selectedDoctor,
      date: !selectedDate,
      time: !selectedTime,
      patientName: !formData.patientName?.trim(),
      phone: !formData.phone?.trim(),
      email: !formData.email?.trim(),
      reason: false // Making reason optional
    };

    // Set form errors
    setFormErrors(errors);

    // Check if any required field is empty
    const hasErrors = Object.entries(errors)
      .filter(([key]) => key !== 'reason') // Exclude reason as it's optional
      .some(([_, value]) => value);

    if (hasErrors) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book an appointment",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Only validate when submitting
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!selectedDoctor) {
      toast({
        title: "Error",
        description: "Please select a doctor",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Convert doctorId to string if it's an ObjectId
      const doctorId = selectedDoctor._id.toString();

      const appointmentData: Omit<Appointment, '_id' | 'userId'> = {
        doctorId,
        doctorName: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        date: format(selectedDate!, "yyyy-MM-dd"),
        time: selectedTime!,
        status: "pending",
        patientName: formData.patientName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        reason: formData.reason?.trim() || "General Consultation",
        symptoms: formData.symptoms?.trim() || "",
        payment: {
          amount: selectedDoctor.consultationFee || 0,
          status: "pending"
        }
      };

      console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));

      if (rescheduleId) {
        const response = await appointmentService.updateAppointment(rescheduleId, appointmentData);
        console.log('Appointment rescheduled successfully:', response);
        toast({
          title: "Success",
          description: "Appointment rescheduled successfully"
        });
        if (onRescheduleComplete) {
          onRescheduleComplete();
        }
        if (onClose) {
          onClose();
        }
      } else {
        const response = await appointmentService.createAppointment(appointmentData);
        console.log('Appointment created successfully:', response);
        setAppointmentData(response);
        setShowPayment(true);
      }
    } catch (error: any) {
      console.error("Error saving appointment:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to save appointment. Please try again.";
      const validationErrors = error.response?.data?.errors;
      
      if (validationErrors && Array.isArray(validationErrors)) {
        const errorDetails = validationErrors.map((err: any) => 
          err.field ? `${err.field}: ${err.message}` : err.message || err
        ).join('\n');
        
        toast({
          title: "Validation Error",
          description: errorDetails,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    if (!appointmentData) return;

    try {
      // Generate a random transaction ID (in real app, this would come from payment gateway)
      const transactionId = 'TX_' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Update the payment status
      await appointmentService.updatePaymentStatus(appointmentData._id, {
        paymentMethod: 'UPI',
        transactionId: transactionId
      });

      // Show success message
      toast({
        title: rescheduleId ? "Appointment Rescheduled!" : "Appointment Booked!",
        description: `Your appointment with ${appointmentData.doctorName} has been ${rescheduleId ? 'rescheduled' : 'scheduled'} for ${appointmentData.date} at ${appointmentData.time}.`,
      });

      // Close the payment modal
      setShowPayment(false);

      // Call callbacks and close after successful payment
      if (rescheduleId && onRescheduleComplete) {
        onRescheduleComplete();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Payment Error",
        description: "There was an error confirming your payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      variant: "destructive",
    });
    console.error("Payment error:", error);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    // Prevent reselection of same doctor
    if (doctor._id === selectedDoctor?._id) {
      return;
    }

    // First set the doctor and reset states
    setSelectedDoctor(doctor);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setAvailableSlots([]);
    setActiveTab("book-appointment");

    // Force scroll to top immediately
    window.scrollTo(0, 0);
  };

  // Add debug logs for state changes
  useEffect(() => {
    console.log("Selected doctor changed:", selectedDoctor);
  }, [selectedDoctor]);

  useEffect(() => {
    console.log("Active tab changed:", activeTab);
  }, [activeTab]);

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get booked appointments for a specific date and doctor
  const getBookedSlots = async (date: string, doctorId: string) => {
    try {
      const appointments = await appointmentService.getUserAppointments();
      return appointments
        .filter(apt =>
          apt.date === date &&
          apt.doctorName === selectedDoctor?.name &&
          apt._id !== rescheduleId
        )
        .map(apt => apt.time);
    } catch (error) {
      console.error("Error getting booked slots:", error);
      return [];
    }
  };

  // Get available time slots for the selected date
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableSlots([]);
        return;
      }

      const formattedDate = format(selectedDate, "yyyy-MM-dd");

      try {
        // Get booked slots for this date
        const bookedSlots = await getBookedSlots(formattedDate, selectedDoctor._id);

        // Generate all possible time slots for today
        const slots = FIXED_TIME_SLOTS.map(time => ({
          time,
          isBooked: bookedSlots.includes(time)
        }));

        // If it's today, filter out past time slots
        const now = new Date();
        if (format(selectedDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")) {
          const currentHour = now.getHours();
          const currentMinutes = now.getMinutes();

          return setAvailableSlots(slots.filter(slot => {
            const [hours, minutes] = slot.time.split(":").map(Number);
            return (hours > currentHour) || (hours === currentHour && minutes > currentMinutes);
          }));
        }

        setAvailableSlots(slots);
      } catch (error) {
        console.error("Error fetching available slots:", error);
        setAvailableSlots([]);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, selectedDoctor]);

  // Disable past dates and Sundays
  const disabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  };

  useEffect(() => {
    // Reset selected time when date changes
    setSelectedTime(undefined);
  }, [selectedDate]);

  // Get booked slots count for a specific date
  useEffect(() => {
    const fetchDateAvailability = async (date: Date) => {
      if (!selectedDoctor) return 'disabled';

      const formattedDate = format(date, "yyyy-MM-dd");
      const availability = selectedDoctor.availability.find(a => a.date === formattedDate);

      if (!availability) return 'disabled';

      const bookedSlots = await getBookedSlots(formattedDate, selectedDoctor._id);
      const totalSlots = availability.slots.length;
      const bookedCount = bookedSlots.length;

      if (bookedCount === 0) return 'available';
      if (bookedCount === totalSlots) return 'booked';
      return 'partial';
    };

    // Update availability for visible dates
    const updateAvailability = async () => {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const newAvailability: Record<string, "disabled" | "available" | "booked" | "partial"> = {};

      for (let d = new Date(today); d <= nextMonth; d.setDate(d.getDate() + 1)) {
        const formattedDate = format(d, "yyyy-MM-dd");
        newAvailability[formattedDate] = await fetchDateAvailability(d);
      }

      setDateAvailability(newAvailability);
    };

    updateAvailability();
  }, [selectedDoctor]);

  // Custom calendar day render function
  const renderCalendarDay = (day: Date, props: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = day < today;
    const isSunday = day.getDay() === 0;
    const isSelected = selectedDate ? format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd') : false;
    
    // Get random availability for the date
    const availability = getRandomAvailability(day);

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          if (!isPastDate && !props.disabled && !isSunday) {
            setSelectedDate(day);
            setSelectedTime(undefined);
            setCalendarOpen(false);
          }
        }}
        disabled={isPastDate || props.disabled || isSunday}
        className={cn(
          "h-9 w-9 p-0 font-normal rounded-full flex items-center justify-center relative",
          "transition-colors duration-200 ease-in-out",
          "hover:bg-blue-50",
          isSelected && "bg-blue-500 text-white hover:bg-blue-600",
          !isSelected && !isPastDate && !isSunday && availability === 'available' && "bg-green-100 text-green-900 hover:bg-green-200",
          !isSelected && !isPastDate && !isSunday && availability === 'partial' && "bg-yellow-100 text-yellow-900 hover:bg-yellow-200",
          !isSelected && !isPastDate && !isSunday && availability === 'booked' && "bg-red-100 text-red-900 hover:bg-red-200",
          (isPastDate || isSunday) && "bg-gray-100 text-gray-400 cursor-not-allowed hover:bg-gray-100",
          !isPastDate && !isSunday && !props.disabled && "cursor-pointer"
        )}
      >
        {format(day, 'd')}
      </button>
    );
  };

  // Clear form errors when fields are filled
  useEffect(() => {
    if (selectedDoctor) {
      setFormErrors(prev => ({ ...prev, doctor: false }));
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedDate) {
      setFormErrors(prev => ({ ...prev, date: false }));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedTime) {
      setFormErrors(prev => ({ ...prev, time: false }));
    }
  }, [selectedTime]);

  useEffect(() => {
    const { patientName, phone, email } = formData;
    setFormErrors(prev => ({
      ...prev,
      patientName: prev.patientName && !patientName.trim(),
      phone: prev.phone && !phone.trim(),
      email: prev.email && !email.trim()
    }));
  }, [formData]);

  // Reset form errors when form is not being submitted
  useEffect(() => {
    if (!loading) {
      setFormErrors({
        doctor: false,
        date: false,
        time: false,
        patientName: false,
        phone: false,
        email: false,
        reason: false
      });
    }
  }, [loading]);

  const handleTimeSelect = (time: string): void => {
    setSelectedTime(time);
    // Remove the form error for time if it exists
    setFormErrors(prev => ({ ...prev, time: false }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {showPayment ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Consultation Fee:</span>
                  <span className="font-semibold">₹{selectedDoctor?.consultationFee || 0}</span>
                </div>
                <Payment
                  amount={selectedDoctor?.consultationFee || 0}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowPayment(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="w-full">
          <Tabs
            value={activeTab}
            className="w-full"
            onValueChange={(value) => {
              if (value === "book-appointment" && !selectedDoctor) {
                return;
              }
              setActiveTab(value);
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="find-doctor" className="relative">
                Find Doctor
              </TabsTrigger>
              <TabsTrigger value="book-appointment" className="relative">
                Book Appointment
              </TabsTrigger>
            </TabsList>

            <div>
              <TabsContent value="find-doctor" className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by doctor name or specialization..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  {filteredDoctors.map((doctor) => (
                    <div key={doctor._id}>
                      <Card
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-lg",
                          selectedDoctor?._id === doctor._id && "ring-2 ring-blue-500"
                        )}
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                              <img
                                src={doctor.image.startsWith('http') ? doctor.image : `${BACKEND_URL}${doctor.image}`}
                                alt={`Dr. ${doctor.name}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/default-doctor.png'; // Fallback image
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg truncate">{doctor.name}</h3>
                              <p className="text-sm text-gray-500">{doctor.specialization}</p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-sm text-gray-500">{doctor.experience}</span>
                                <span className="text-gray-300">•</span>
                                <div className="flex items-center">
                                  <span className="text-yellow-500 mr-1">★</span>
                                  <span className="text-sm font-medium">{doctor.rating}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="book-appointment">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {!selectedDoctor ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900">No Doctor Selected</h3>
                      <p className="mt-2 text-sm text-gray-500">Please select a doctor from the Find Doctor tab first.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("find-doctor")}
                      >
                        Go to Find Doctor
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Card className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-full md:w-1/3">
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={selectedDoctor.image.startsWith('http') ? selectedDoctor.image : `${BACKEND_URL}${selectedDoctor.image}`}
                                  alt={selectedDoctor.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/default-doctor.png'; // Fallback image
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex-1 space-y-4">
                              <div>
                                <h2 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h2>
                                <p className="text-lg text-blue-600">{selectedDoctor.specialization}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                  <span className="text-yellow-400 mr-1">★</span>
                                  <span className="font-medium">{selectedDoctor.rating}</span>
                                </div>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-600">{selectedDoctor.experience}</span>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Languages</h4>
                                <div className="flex flex-wrap gap-2">
                                  {selectedDoctor.languages?.map((language) => (
                                    <span
                                      key={language}
                                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                    >
                                      {language}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {selectedDoctor.achievements && selectedDoctor.achievements.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium text-gray-900">Achievements</h4>
                                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    {selectedDoctor.achievements.map((achievement, index) => (
                                      <li key={index}>{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              <div className="pt-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-600">Consultation Fee</span>
                                  <span className="text-xl font-bold text-green-600">₹{selectedDoctor.consultationFee}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-6">
                        <div className="space-y-2 relative">
                          <Label>Select Date</Label>
                          <div className="space-y-2">
                            <Popover
                              open={calendarOpen}
                              onOpenChange={setCalendarOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !selectedDate && "text-muted-foreground"
                                  )}
                                  onClick={() => setCalendarOpen(true)}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="center"
                                side="bottom"
                                sideOffset={8}
                                alignOffset={0}
                              >
                                <div className="flex flex-col">
                                  <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                      if (date && date.getDay() !== 0) {
                                        setSelectedDate(date);
                                        setSelectedTime(undefined);
                                        setCalendarOpen(false);
                                      }
                                    }}
                                    disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      return date < today || date.getDay() === 0;
                                    }}
                                    initialFocus
                                    components={{
                                      Day: ({ date }) => renderCalendarDay(date, {
                                        disabled: date < new Date() || date.getDay() === 0
                                      })
                                    }}
                                    className="rounded-md border"
                                  />
                                  
                                  {/* Availability Legend */}
                                  <div className="p-3 border-t">
                                    <p className="text-sm font-medium mb-2">Time Slots Availability</p>
                                    <div className="flex flex-col gap-2 text-sm">
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200"></div>
                                        <span>Available - Multiple slots open</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-200"></div>
                                        <span>Waiting - Limited slots left</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
                                        <span>Not Available - No slots open</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"></div>
                                        <span>Past dates or Sundays</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Select Time</Label>
                          {!selectedDate && (
                            <p className="text-sm text-gray-500">Please select a date first</p>
                          )}
                          {selectedDate && availableSlots.length === 0 && (
                            <p className="text-sm text-yellow-600">No available time slots for this date</p>
                          )}
                          {availableSlots.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                              {availableSlots.map(({ time, isBooked }) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? "default" : "outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    isBooked && "opacity-50 cursor-not-allowed",
                                    selectedTime === time && "bg-blue-500 text-white hover:bg-blue-600"
                                  )}
                                  type="button" // Add this to prevent form submission
                                  disabled={isBooked}
                                  onClick={() => handleTimeSelect(time)}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  {time}
                                </Button>
                              ))}
                            </div>
                          )}
                          {selectedDate && availableSlots.every(slot => slot.isBooked) && (
                            <p className="text-sm text-yellow-600 mt-1">
                              All slots are booked for this date. Please select another date.
                            </p>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="name"
                                placeholder="Enter your full name"
                                className="pl-10"
                                value={formData.patientName || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="phone"
                                placeholder="Enter your phone number"
                                className="pl-10"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              value={formData.email || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason for Visit</Label>
                          <div className="relative">
                            <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="reason"
                              placeholder="Brief reason for your visit (optional)"
                              className="pl-10"
                              value={formData.reason || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                          <Textarea
                            id="symptoms"
                            placeholder="Describe your symptoms..."
                            value={formData.symptoms || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Processing..." : "Book Appointment"}
                      </Button>
                    </>
                  )}
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BookAppointment;