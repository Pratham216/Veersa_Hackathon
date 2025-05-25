import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { 
  User, 
  Calendar as CalendarIcon, 
  FileText, 
  ClipboardList, 
  Clock, 
  Upload, 
  Pencil, 
  Save, 
  X, 
  LogOut,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import { cn } from "@/lib/utils";

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  nextAppointment: string | null;
  condition: string;
  email: string;
  phone: string;
}

interface Appointment {
  _id: string;
  patientName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  type: string;
  reason: string;
  symptoms?: string;
  phone: string;
  email: string;
}

interface MedicalReport {
  _id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  reportFile?: string;
}

interface Prescription {
  _id: string;
  patientName: string;
  date: string;
  prescriptionFile?: string;
  notes: string;
}

interface PatientDetails {
  _id: string;
  name: string;
  age: number;
  gender: string;
  email: string;
  phone: string;
  bloodGroup: string;
  medicalHistory: Array<{
    condition: string;
    diagnosis: string;
    treatment: string;
    date: string;
  }>;
  uploadedReports: Array<{
    _id: string;
    title: string;
    date: string;
    fileUrl: string;
  }>;
}

interface DoctorProfile {
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  licenseNumber: string;
  clinicAddress: string;
  consultationFee: string;
  profilePhoto: string;
  email: string;
  phone: string;
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [newReport, setNewReport] = useState({
    diagnosis: '',
    prescription: '',
    notes: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<PatientDetails | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<DoctorProfile>({
    name: '',
    specialty: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    clinicAddress: '',
    consultationFee: '',
    profilePhoto: '/default-doctor.png',
    email: '',
    phone: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // Load doctor's data
  useEffect(() => {
    const loadDoctorData = async () => {
      try {
        // Fetch patients (correct endpoint)
        const response = await api.get('/patients');
        if (response.data) {
          setPatients(response.data);
        } else {
          toast.error('Failed to load patients');
        }

        // Fetch appointments
        const appointmentsResponse = await fetch('/api/doctor/appointments', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const appointmentsData = await appointmentsResponse.json();
        if (appointmentsResponse.ok) {
          setAppointments(appointmentsData);
        }

        // Fetch reports
        const reportsResponse = await fetch('/api/doctor/medical-reports', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const reportsData = await reportsResponse.json();
        if (reportsResponse.ok) {
          setReports(reportsData);
        }

        // Fetch prescriptions
        const prescriptionsResponse = await fetch('/api/doctor/prescriptions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const prescriptionsData = await prescriptionsResponse.json();
        if (prescriptionsResponse.ok) {
          setPrescriptions(prescriptionsData);
        }
      } catch (error) {
        console.error('Error loading doctor data:', error);
        toast.error('Failed to load data');
      }
    };

    loadDoctorData();
  }, []);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // First try to load from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setProfileData(prev => ({
            ...prev,
            name: userData.name || '',
            specialty: userData.specialty || '',
            qualification: userData.qualification || '',
            experience: userData.experience || '',
            licenseNumber: userData.licenseNumber || '',
            clinicAddress: userData.clinicAddress || '',
            consultationFee: userData.consultationFee || '',
            profilePhoto: userData.profilePhoto || '/default-doctor.png',
            email: userData.email || '',
            phone: userData.phone || ''
          }));
        }

        // Then fetch fresh data from the server
        const response = await api.get('/api/auth/profile');
        const serverData = response.data;
        
        setProfileData(prev => ({
          ...prev,
          name: serverData.name || prev.name,
          specialty: serverData.specialty || prev.specialty,
          qualification: serverData.qualification || prev.qualification,
          experience: serverData.experience || prev.experience,
          licenseNumber: serverData.licenseNumber || prev.licenseNumber,
          clinicAddress: serverData.clinicAddress || prev.clinicAddress,
          consultationFee: serverData.consultationFee || prev.consultationFee,
          profilePhoto: serverData.profilePhoto || prev.profilePhoto,
          email: serverData.email || prev.email,
          phone: serverData.phone || prev.phone
        }));

        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(serverData));
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load profile data');
      }
    };

    loadProfileData();
  }, []);

  // Fetch doctor's appointments
  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      if (!user || !profileData) return;

      setIsLoadingAppointments(true);
      try {
        // Get today's date at start of day
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch all appointments
        const response = await api.get('/appointments');
        const allAppointments = response.data;

        // Filter appointments for this doctor based on name and license number
        const doctorAppointments = allAppointments.filter((apt: any) => 
          apt.doctorName === profileData.name && 
          apt.doctorLicenseNumber === profileData.licenseNumber
        );

        // Filter and sort upcoming appointments
        const upcoming = doctorAppointments
          .filter((apt: Appointment) => {
            const aptDate = new Date(apt.date);
            aptDate.setHours(0, 0, 0, 0);
            return aptDate >= today && apt.status !== 'cancelled';
          })
          .sort((a: Appointment, b: Appointment) => {
            // Sort by date first
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA.getTime() - dateB.getTime();
            }
            // If same date, sort by time
            return a.time.localeCompare(b.time);
          });

        setUpcomingAppointments(upcoming);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchDoctorAppointments();
  }, [user, profileData]);

  const handleCreateReport = () => {
    if (!selectedPatient) {
      toast("Please select a patient", {
        description: "A patient must be selected to create a medical report.",
      });
      return;
    }

    const patient = patients.find(p => p._id === selectedPatient);
    if (!patient) return;

    const newMedicalReport: MedicalReport = {
      _id: (reports.length + 1).toString(),
      patientId: patient._id,
      patientName: patient.name,
      date: format(new Date(), 'yyyy-MM-dd'),
      diagnosis: newReport.diagnosis,
      prescription: newReport.prescription,
      notes: newReport.notes
    };

    setReports([...reports, newMedicalReport]);
    setNewReport({ diagnosis: '', prescription: '', notes: '' });
    
    toast("Report Created", {
      description: "Medical report has been created successfully.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handlePrescriptionSubmit = async () => {
    if (!selectedPatient || !selectedFile) {
      toast.error('Please select a patient and upload a prescription file');
      return;
    }

    const formData = new FormData();
    formData.append('prescriptionFile', selectedFile);
    formData.append('patientId', selectedPatient);
    formData.append('notes', newReport.notes);

    try {
      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Prescription uploaded successfully');
        setSelectedFile(null);
        setNewReport({ ...newReport, notes: '' });
        // Refresh prescriptions list from backend
        const updatedPrescriptions = await fetch('/api/doctor/prescriptions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }).then(res => res.json());
        setPrescriptions(updatedPrescriptions);
      } else {
        toast.error('Failed to upload prescription');
      }
    } catch (error) {
      console.error('Error uploading prescription:', error);
      toast.error('Failed to upload prescription');
    }
  };

  const handleViewReport = async (patientId: string) => {
    try {
      const response = await fetch(`/api/doctor/patients/${patientId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedPatientDetails(data);
        setShowPatientDetails(true);
      } else {
        toast.error('Failed to load patient details');
      }
    } catch (error) {
      console.error('Error loading patient details:', error);
      toast.error('Failed to load patient details');
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous preview URL if it exists
      if (profileData.profilePhoto && profileData.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profilePhoto);
      }

      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileData(prev => ({
        ...prev,
        profilePhoto: previewUrl
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      
      // Add all profile data
      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add photo if changed
      if (photoFile) {
        formData.append('profilePhoto', photoFile);
      }

      const response = await api.put('/users/profile', formData, {
        headers: {
          // Don't set Content-Type here, it will be set automatically for FormData
        }
      });

      // Clean up any existing blob URL
      if (profileData.profilePhoto && profileData.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(profileData.profilePhoto);
      }

      const updatedUser = response.data;
      
      // Update local state and storage
      setProfileData(prev => ({
        ...prev,
        ...updatedUser,
        profilePhoto: updatedUser.profilePhoto || '/default-doctor.png'
      }));

      // Update localStorage with complete user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUserData = {
        ...currentUser,
        ...updatedUser,
        profilePhoto: updatedUser.profilePhoto || '/default-doctor.png'
      };
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Dispatch profile update event
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: updatedUserData
      }));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
      setPhotoFile(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = () => {
    // Clear all auth-related data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');

    // Show success message
    toast.success('Logged out successfully');

    // Redirect to home page
    navigate('/');
  };

  const handleDeleteReport = (reportId: string) => {
    try {
      // Remove the report from the state
      setReports(reports.filter(report => report._id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Failed to delete report');
    }
  };

  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      const response = await fetch(`/api/doctor/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        setPrescriptions(prescriptions.filter(p => p._id !== prescriptionId));
        toast.success('Prescription deleted successfully');
      } else {
        toast.error('Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    }
  };

  // Function to check if a date is within the next 30 days
  const isWithinNext30Days = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    return date >= today && date <= thirtyDaysFromNow;
  };

  // Function to randomly generate availability status for demonstration
  const getRandomAvailability = (date: Date) => {
    if (!isWithinNext30Days(date)) {
      return "default";
    }
    // Generate a random number between 0 and 2
    const random = Math.floor(Math.random() * 3);
    return random === 0 ? "available" : random === 1 ? "waiting" : "not-available";
  };

  // Custom calendar day render function
  const renderCalendarDay = (day: Date) => {
    const availability = getRandomAvailability(day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If it's a past date, return default styling
    if (day < today) {
      return (
        <div className="h-9 w-9 p-0 font-normal rounded-full flex items-center justify-center text-gray-400">
          {format(day, "d")}
        </div>
      );
    }
    
    return (
      <div
        className={cn(
          "h-9 w-9 p-0 font-normal rounded-full flex items-center justify-center",
          {
            "bg-green-100 text-green-900": availability === "available",
            "bg-yellow-100 text-yellow-900": availability === "waiting",
            "bg-red-100 text-red-900": availability === "not-available",
            "": availability === "default"
          }
        )}
      >
        {format(day, "d")}
      </div>
    );
  };

  const handleManageAppointment = async (appointmentId: string, action: 'confirm' | 'complete' | 'cancel') => {
    try {
      // Convert action to the correct status type
      const statusMap = {
        'confirm': 'confirmed',
        'complete': 'completed',
        'cancel': 'cancelled'
      } as const;
      
      const newStatus = statusMap[action];
      await api.put(`/appointments/${appointmentId}/status`, { 
        status: newStatus,
        doctorName: profileData.name,
        doctorLicenseNumber: profileData.licenseNumber
      });
      
      // Update the appointment status locally
      setUpcomingAppointments(prev => 
        prev.map(apt => 
          apt._id === appointmentId 
            ? { ...apt, status: newStatus } 
            : apt
        )
      );

      toast.success(`Appointment ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      toast.error(`Failed to ${action} appointment`);
    }
  };

  const navItems = [
    { path: "/doctor/profile", icon: User, label: "Profile" },
    { path: "/doctor/patients", icon: User, label: "Patients List" },
    { path: "/doctor/appointments", icon: CalendarIcon, label: "Appointments" },
    { path: "/doctor/reports", icon: FileText, label: "Medical Reports" },
    { path: "/doctor/prescriptions", icon: ClipboardList, label: "Prescriptions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 relative pb-16">
      <div className="p-8 mb-16">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Doctor Profile</CardTitle>
              <CardDescription>Your professional information</CardDescription>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                  <img
                    src={profileData.profilePhoto}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-doctor.png';
                    }}
                  />
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    <Pencil className="w-4 h-4" />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="font-medium">{profileData.name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Specialty</Label>
                    {isEditing ? (
                      <Input
                        name="specialty"
                        value={profileData.specialty}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="font-medium">{profileData.specialty}</p>
                    )}
                  </div>
                  <div>
                    <Label>Qualification</Label>
                    {isEditing ? (
                      <Input
                        name="qualification"
                        value={profileData.qualification}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="font-medium">{profileData.qualification}</p>
                    )}
                  </div>
                  <div>
                    <Label>Experience</Label>
                    {isEditing ? (
                      <Input
                        name="experience"
                        value={profileData.experience}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="font-medium">{profileData.experience}</p>
                    )}
                  </div>
                  <div>
                    <Label>License Number</Label>
                    {isEditing ? (
                      <Input
                        name="licenseNumber"
                        value={profileData.licenseNumber}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <p className="font-medium">{profileData.licenseNumber}</p>
                    )}
                  </div>
                  <div>
                    <Label>Consultation Fee</Label>
                    {isEditing ? (
                      <Input
                        name="consultationFee"
                        value={profileData.consultationFee}
                        onChange={handleInputChange}
                        type="number"
                      />
                    ) : (
                      <p className="font-medium">₹{profileData.consultationFee}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Label>Clinic Address</Label>
                  {isEditing ? (
                    <Input
                      name="clinicAddress"
                      value={profileData.clinicAddress}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <p className="font-medium">{profileData.clinicAddress}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patients" className="flex items-center">
              <User size={16} className="mr-2" />
              <span>Patients</span>
            </TabsTrigger>
            <TabsTrigger value="appointments" className="flex items-center">
              <CalendarIcon size={16} className="mr-2" />
              <span>Appointments</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              <FileText size={16} className="mr-2" />
              <span>Medical Reports</span>
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="flex items-center">
              <ClipboardList size={16} className="mr-2" />
              <span>Prescriptions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <Card>
              <CardHeader>
                <CardTitle>Patient List</CardTitle>
                <CardDescription>View and manage your assigned patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Next Appointment</TableHead>
                        {/* Removed Actions column */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            No patients found
                          </TableCell>
                        </TableRow>
                      ) : (
                        patients.map((patient) => (
                          <TableRow key={patient._id}>
                            <TableCell>{patient.name || "NA"}</TableCell>
                            <TableCell>
                              {patient.age !== undefined && patient.age !== null ? patient.age : "NA"}
                            </TableCell>
                            <TableCell>{patient.gender || "NA"}</TableCell>
                            <TableCell>{patient.email || "NA"}</TableCell>
                            <TableCell>{patient.phone || "NA"}</TableCell>
                            <TableCell>{patient.lastVisit || "NA"}</TableCell>
                            <TableCell>{patient.nextAppointment || "NA"}</TableCell>
                            {/* Removed Actions cell */}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Appointment Calendar</CardTitle>
                  <CardDescription>Manage your appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      components={{
                        Day: ({ date }) => renderCalendarDay(date),
                      }}
                    />
                    
                    {/* Availability Legend */}
                    <div className="flex flex-col gap-2 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-100 border border-green-200"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-100 border border-yellow-200"></div>
                        <span>Waiting</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
                        <span>Not Available</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>
                    Showing appointments for Dr. {profileData.name} (License: {profileData.licenseNumber})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoadingAppointments ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : upcomingAppointments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-4">
                              No upcoming appointments
                            </TableCell>
                          </TableRow>
                        ) : (
                          upcomingAppointments.map((appointment) => (
                            <TableRow key={appointment._id}>
                              <TableCell>{format(new Date(appointment.date), 'MMM dd, yyyy')}</TableCell>
                              <TableCell>{appointment.time}</TableCell>
                              <TableCell>{appointment.patientName}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{appointment.phone}</div>
                                  <div className="text-gray-500">{appointment.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-[200px] truncate">
                                  {appointment.reason}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                  {
                                    "bg-yellow-100 text-yellow-800": appointment.status === 'pending',
                                    "bg-green-100 text-green-800": appointment.status === 'confirmed',
                                    "bg-blue-100 text-blue-800": appointment.status === 'completed',
                                    "bg-red-100 text-red-800": appointment.status === 'cancelled'
                                  }
                                )}>
                                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {appointment.status === 'pending' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleManageAppointment(appointment._id, 'confirm')}
                                    >
                                      Confirm
                                    </Button>
                                  )}
                                  {appointment.status === 'confirmed' && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleManageAppointment(appointment._id, 'complete')}
                                    >
                                      Complete
                                    </Button>
                                  )}
                                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleManageAppointment(appointment._id, 'cancel')}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create Medical Report</CardTitle>
                  <CardDescription>Add a new medical report for a patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="patient">Select Patient</Label>
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="diagnosis">Diagnosis</Label>
                      <Input
                        id="diagnosis"
                        value={newReport.diagnosis}
                        onChange={(e) => setNewReport({ ...newReport, diagnosis: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="prescription">Prescription</Label>
                      <Textarea
                        id="prescription"
                        value={newReport.prescription}
                        onChange={(e) => setNewReport({ ...newReport, prescription: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newReport.notes}
                        onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                      />
                    </div>

                    <Button type="button" onClick={handleCreateReport}>
                      Create Report
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Patient Details Modal */}
              {showPatientDetails && selectedPatientDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedPatientDetails.name}</h2>
                        <p className="text-gray-500">
                          {selectedPatientDetails.age} years • {selectedPatientDetails.gender}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPatientDetails(false)}
                      >
                        Close
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedPatientDetails.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedPatientDetails.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Blood Group</p>
                        <p className="font-medium">{selectedPatientDetails.bloodGroup}</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Medical History</h3>
                        <div className="space-y-4">
                          {selectedPatientDetails.medicalHistory.map((record, index) => (
                            <div key={index} className="p-4 rounded-lg border">
                              <div className="flex justify-between mb-2">
                                <h4 className="font-medium">{record.condition}</h4>
                                <span className="text-sm text-gray-500">{record.date}</span>
                              </div>
                              <p className="text-sm mb-2"><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                              <p className="text-sm"><span className="font-medium">Treatment:</span> {record.treatment}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Uploaded Reports</h3>
                        <div className="space-y-4">
                          {selectedPatientDetails.uploadedReports.map((report) => (
                            <div key={report._id} className="p-4 rounded-lg border">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h4 className="font-medium">{report.title}</h4>
                                  <p className="text-sm text-gray-500">{report.date}</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(report.fileUrl, '_blank')}
                                >
                                  View Report
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Recent Reports</h3>
                        <div className="space-y-4">
                          {reports
                            .filter(report => report.patientId === selectedPatientDetails._id)
                            .map((report) => (
                              <div key={report._id} className="p-4 rounded-lg border">
                                <div className="flex justify-between mb-2">
                                  <span className="text-sm text-gray-500">{report.date}</span>
                                </div>
                                <p className="text-sm mb-2"><span className="font-medium">Diagnosis:</span> {report.diagnosis}</p>
                                <p className="text-sm mb-2"><span className="font-medium">Prescription:</span> {report.prescription}</p>
                                {report.notes && (
                                  <p className="text-sm"><span className="font-medium">Notes:</span> {report.notes}</p>
                                )}
                                {report.reportFile && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => window.open(report.reportFile, '_blank')}
                                  >
                                    View Attached Report
                                  </Button>
                                )}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Reports Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Medical Reports</CardTitle>
                  <CardDescription>View recently created medical reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reports.length === 0 ? (
                      <p className="text-center text-gray-500">No medical reports found</p>
                    ) : (
                      reports.map((report) => (
                        <div key={report._id} className="p-6 rounded-lg border hover:border-gray-300 transition-colors">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-lg mb-1">{report.patientName}</h4>
                              <p className="text-sm text-gray-500">Date: {report.date}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* Removed View Full Report button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteReport(report._id)}
                              >
                                <X size={20} />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid gap-4 text-sm">
                            <div className="space-y-2">
                              <h5 className="font-semibold text-gray-700">Diagnosis</h5>
                              <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{report.diagnosis}</p>
                            </div>
                            
                            <div className="space-y-2">
                              <h5 className="font-semibold text-gray-700">Prescription</h5>
                              <p className="text-gray-600 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{report.prescription}</p>
                            </div>
                            
                            {report.notes && (
                              <div className="space-y-2">
                                <h5 className="font-semibold text-gray-700">Additional Notes</h5>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-md">{report.notes}</p>
                              </div>
                            )}
                            
                            {report.reportFile && (
                              <div className="mt-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 p-0"
                                  onClick={() => window.open(report.reportFile, '_blank')}
                                >
                                  View Attached Report File
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prescriptions">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Prescription</CardTitle>
                  <CardDescription>Upload a prescription for a patient</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="patient">Select Patient</Label>
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient._id} value={patient._id}>
                              {patient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="prescription">Upload Prescription File</Label>
                      <div className="mt-2">
                        <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                          <span className="flex items-center space-x-2">
                            <Upload className="w-6 h-6 text-gray-600" />
                            <span className="font-medium text-gray-600">
                              {selectedFile ? selectedFile.name : 'Drop files to Attach, or browse'}
                            </span>
                          </span>
                          <input
                            type="file"
                            name="prescription"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={newReport.notes}
                        onChange={(e) => setNewReport({ ...newReport, notes: e.target.value })}
                      />
                    </div>

                    <Button type="button" onClick={handlePrescriptionSubmit}>
                      Upload Prescription
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Prescriptions</CardTitle>
                  <CardDescription>View recently uploaded prescriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.length === 0 ? (
                      <p className="text-center text-gray-500">No prescriptions found</p>
                    ) : (
                      prescriptions.map((prescription) => (
                        <div key={prescription._id} className="p-4 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold">{prescription.patientName}</h4>
                              <p className="text-sm text-gray-500">{prescription.date}</p>
                              <p className="text-sm">Notes: {prescription.notes}</p>
                              {prescription.prescriptionFile && (
                                <p className="text-sm text-blue-600 break-all">
                                  File: {prescription.prescriptionFile}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {prescription.prescriptionFile && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(prescription.prescriptionFile, '_blank')}
                                >
                                  Download
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeletePrescription(prescription._id)}
                              >
                                <X size={20} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Logout Button - In a fixed footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
        <Button
          variant="destructive"
          size="default"
          onClick={handleLogout}
          className="flex items-center space-x-2 font-bold"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

export default DoctorDashboard;