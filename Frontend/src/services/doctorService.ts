import api from '@/lib/axios';

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  image: string;
  description: string;
  education: string;
  languages: string[];
  achievements: string[];
  consultationFee: number;
  isAvailable: boolean;
  availability: {
    date: string;
    slots: string[];
  }[];
}

const doctorService = {
  getAllDoctors: async (): Promise<Doctor[]> => {
    const response = await api.get('/api/doctors');
    return response.data;
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    const response = await api.get(`/api/doctors/${id}`);
    return response.data;
  },

  createDoctor: async (doctorData: Omit<Doctor, '_id'>): Promise<Doctor> => {
    const response = await api.post('/api/doctors', doctorData);
    return response.data;
  },

  updateDoctor: async (id: string, doctorData: Partial<Doctor>): Promise<Doctor> => {
    const response = await api.put(`/api/doctors/${id}`, doctorData);
    return response.data;
  },

  deleteDoctor: async (id: string): Promise<void> => {
    await api.delete(`/api/doctors/${id}`);
  }
};

export default doctorService; 