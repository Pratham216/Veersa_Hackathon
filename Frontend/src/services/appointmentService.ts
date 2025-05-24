import api from '@/lib/axios';

export interface Appointment {
  _id: string;
  userId: string;
  doctorId?: string;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  patientName: string;
  phone: string;
  email: string;
  reason: string;
  symptoms?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment: {
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    paymentMethod?: string;
  };
}

const appointmentService = {
  getUserAppointments: async (): Promise<Appointment[]> => {
    try {
      console.log('Fetching user appointments...');
      const response = await api.get('/api/appointments');
      console.log('Appointments fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointments:', error.response?.data || error.message);
      throw error;
    }
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    try {
      console.log(`Fetching appointment with ID: ${id}`);
      const response = await api.get(`/api/appointments/${id}`);
      console.log('Appointment fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  createAppointment: async (appointmentData: Omit<Appointment, '_id' | 'userId'>): Promise<Appointment> => {
    try {
      console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
      
      // Validate required fields before sending to server
      const requiredFields = ['doctorName', 'specialization', 'date', 'time', 'patientName', 'phone', 'email', 'reason'];
      const missingFields = requiredFields.filter(field => !appointmentData[field as keyof typeof appointmentData]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate payment data
      if (!appointmentData.payment?.amount || typeof appointmentData.payment.amount !== 'number' || appointmentData.payment.amount <= 0) {
        throw new Error('Payment amount is required and must be a positive number');
      }

      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(appointmentData.phone.replace(/[\s-]/g, ''))) {
        throw new Error('Invalid phone number format');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(appointmentData.email)) {
        throw new Error('Invalid email format');
      }

      const response = await api.post('/api/appointments', appointmentData);
      console.log('Appointment created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating appointment:', error.response?.data || error);
      
      // If it's a validation error from our frontend validation
      if (error.message) {
        throw {
          response: {
            data: {
              message: 'Validation error',
              errors: [{ message: error.message }]
            }
          }
        };
      }
      
      throw error;
    }
  },

  updateAppointment: async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    try {
      console.log(`Updating appointment ${id} with data:`, JSON.stringify(appointmentData, null, 2));
      const response = await api.put(`/api/appointments/${id}`, appointmentData);
      console.log('Appointment updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating appointment:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePaymentStatus: async (id: string, paymentData: { paymentMethod: string; transactionId: string; }): Promise<Appointment> => {
    try {
      console.log(`Updating payment status for appointment ${id} with data:`, paymentData);
      
      // Validate payment data
      if (!paymentData.paymentMethod || !paymentData.transactionId) {
        throw new Error('Payment method and transaction ID are required');
      }

      const response = await api.post(`/api/appointments/${id}/payment`, paymentData);
      console.log('Payment status updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating payment status:', error.response?.data || error.message);
      throw error;
    }
  },

  deleteAppointment: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting appointment ${id}`);
      await api.delete(`/api/appointments/${id}`);
      console.log('Appointment deleted successfully');
    } catch (error: any) {
      console.error('Error deleting appointment:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default appointmentService; 