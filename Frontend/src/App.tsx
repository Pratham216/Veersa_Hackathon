import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Appointments from "./pages/Appointments";
import Consultation from "./pages/Consultation";
import DeviceMonitoring from "./pages/DeviceMonitoring";
import AIAssistant from "./pages/AIAssistant";
import MedicalRecords from "./pages/MedicalRecords";
import EmergencyServices from "./pages/EmergencyServices";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ManageAppointments from "./pages/ManageAppointments";
import InstantCare from "./components/InstantCare";
import Layout from "./components/Layout";
import MedicalHistory from './pages/MedicalHistory';
import ViewHealthDashboard from './pages/ViewHealthDashboard';
import SymptomChecker from "@/pages/SymptomChecker";
import BookAppointment from "@/components/BookAppointment";
import SheCare from './pages/SheCare';
import { Toaster as HotToaster } from 'react-hot-toast';
import Emergency from "./components/Emergency";
import { ProfileProvider } from "./contexts/ProfileContext";
import DoctorDashboard from './pages/DoctorDashboard';
// import PregnancyProgress from '@/components/PregnancyProgress';
// import Emergency from '@/components/Emergency';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userType = localStorage.getItem('userType');

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  // Redirect doctors to their dashboard if they try to access patient routes
  if (userType === 'doctor' && window.location.pathname === '/dashboard') {
    return <Navigate to="/doctor/dashboard" />;
  }

  // Redirect patients to their dashboard if they try to access doctor routes
  if (userType === 'patient' && window.location.pathname.startsWith('/doctor')) {
    return <Navigate to="/dashboard" />;
  }

  // Wrap patient routes with Layout
  if (userType === 'patient' && !window.location.pathname.startsWith('/doctor')) {
    return <Layout>{children}</Layout>;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProfileProvider>
        <Toaster />
        <Sonner />
        <HotToaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/doctor/dashboard" element={<PrivateRoute><DoctorDashboard /></PrivateRoute>} />
            <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
            <Route path="/manage-appointments" element={<PrivateRoute><ManageAppointments /></PrivateRoute>} />
            <Route path="/book-appointment" element={<PrivateRoute><BookAppointment /></PrivateRoute>} />
            <Route path="/consultation/:id" element={<PrivateRoute><Consultation /></PrivateRoute>} />
            <Route path="/devices" element={<PrivateRoute><DeviceMonitoring /></PrivateRoute>} />
            <Route path="/assistant" element={<PrivateRoute><AIAssistant /></PrivateRoute>} />
            <Route path="/medical-records" element={<PrivateRoute><MedicalRecords /></PrivateRoute>} />
            <Route path="/shecare" element={<PrivateRoute><SheCare /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/instant-care" element={<PrivateRoute><InstantCare onStartConsultation={() => {}} /></PrivateRoute>} />
            <Route path="/health-dashboard" element={<PrivateRoute><ViewHealthDashboard /></PrivateRoute>} />
            <Route path="/symptom-checker" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
            <Route path="/records" element={<Navigate to="/medical-records" replace />} />
            <Route path="/emergency" element={<PrivateRoute><Emergency /></PrivateRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ProfileProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;