// src/services/api.ts
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL as string;

if (!BASE_URL) {
  throw new Error("VITE_BACKEND_URL is not defined in your environment variables.");
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    userType: string;
    specialty?: string;
    qualification?: string;
    experience?: string;
    licenseNumber?: string;
    clinicAddress?: string;
    consultationFee?: string;
  }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: FormData) => 
    api.put('/auth/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: FormData) => 
    api.put('/users/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
};

// Doctor API
export const doctorAPI = {
  // Patient management
  getPatients: () => api.get('/doctor/patients'),
  getPatientDetails: (patientId: string) => api.get(`/doctor/patients/${patientId}`),
  
  // Appointment management
  getAppointments: () => api.get('/doctor/appointments'),
  updateAppointmentStatus: (appointmentId: string, status: string) =>
    api.put(`/doctor/appointments/${appointmentId}/status`, { status }),
  
  // Medical records
  createMedicalReport: (data: {
    patientId: string;
    diagnosis: string;
    prescription: string;
    notes: string;
  }) => api.post('/doctor/medical-reports', data),
  getMedicalReports: (patientId: string) =>
    api.get(`/doctor/medical-reports/${patientId}`),
  
  // Prescriptions
  createPrescription: (data: {
    patientId: string;
    medicines: string;
    instructions: string;
    date: string;
  }) => api.post('/doctor/prescriptions', data),
  getPrescriptions: (patientId: string) =>
    api.get(`/doctor/prescriptions/${patientId}`),
};

// Patient API
export const patientAPI = {
  // Appointments
  bookAppointment: (data: {
    doctorId: string;
    date: string;
    time: string;
    type: string;
  }) => api.post('/patient/appointments', data),
  getAppointments: () => api.get('/patient/appointments'),
  cancelAppointment: (appointmentId: string) =>
    api.delete(`/patient/appointments/${appointmentId}`),
  
  // Medical records
  getMedicalRecords: () => api.get('/patient/medical-records'),
  
  // Prescriptions
  getPrescriptions: () => api.get('/patient/prescriptions'),
};

export default api;