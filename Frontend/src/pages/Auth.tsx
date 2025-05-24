import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Default profile photo constant
const DEFAULT_PROFILE_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d1d5db'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const specialties = [
  "Cardiologist",
  "Dermatologist",
  "Endocrinologist",
  "Gastroenterologist",
  "General Physician",
  "Neurologist",
  "Obstetrician/Gynecologist",
  "Oncologist",
  "Ophthalmologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "Pulmonologist",
  "Radiologist",
  "Surgeon",
  "Urologist"
];

const EyeIcon = ({ visible }: { visible: boolean }) => (
  visible ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m3.249-2.383A9.956 9.956 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.956 9.956 0 01-4.043 5.306M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
  )
);

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'patient' | 'doctor'>('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    userType: 'patient',
    // Doctor specific fields
    specialty: '',
    qualification: '',
    experience: '',
    licenseNumber: '',
    clinicAddress: '',
    consultationFee: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Clear any existing auth data first
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userType');

        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });

        const { token, user } = response.data;
        
        // Store auth data with complete user profile
        localStorage.setItem('token', token);
        localStorage.setItem('userType', user.userType || 'patient');
        localStorage.setItem('user', JSON.stringify({
          ...user,
          profilePhoto: user.profilePhoto || DEFAULT_PROFILE_PHOTO,
          email: formData.email,
          // Ensure all profile fields are included
          name: user.name || '',
          phone: user.phone || '',
          address: user.address || '',
          dateOfBirth: user.dateOfBirth || '',
          gender: user.gender || '',
          bloodGroup: user.bloodGroup || '',
          emergencyContact: user.emergencyContact || '',
          // Doctor specific fields
          specialty: user.specialty || '',
          qualification: user.qualification || '',
          experience: user.experience || '',
          licenseNumber: user.licenseNumber || '',
          clinicAddress: user.clinicAddress || '',
          consultationFee: user.consultationFee || ''
        }));
        localStorage.setItem('isAuthenticated', 'true');

        // Dispatch profile update event
        window.dispatchEvent(new CustomEvent('profileUpdated', { 
          detail: {
            ...user,
            profilePhoto: user.profilePhoto || DEFAULT_PROFILE_PHOTO,
            email: formData.email
          }
        }));
        
        // Navigate based on user type
        navigate(user.userType === 'doctor' ? '/doctor/dashboard' : '/dashboard');
      } else {
        const response = await authAPI.register({
          ...formData,
          userType: userType
        });
        // Registration successful, redirect to login
        toast.success('Registration successful! Please log in.');
        setIsLogin(true);
        // Clear the form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          userType: 'patient',
          specialty: '',
          qualification: '',
          experience: '',
          licenseNumber: '',
          clinicAddress: '',
          consultationFee: ''
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid credentials. Please check your email and password.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (!err.response) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-indigo-700 drop-shadow-sm">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="text-center text-gray-500 mt-2 text-sm">
            {isLogin ? 'Welcome back! Please sign in to continue.' : 'Join us and start your health journey.'}
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-1">
                      Register as
                    </label>
                    <Select
                      value={userType}
                      onValueChange={(value: 'patient' | 'doctor') => {
                        setUserType(value);
                        setFormData(prev => ({ ...prev, userType: value }));
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

              <div>
                <label htmlFor="name" className="sr-only">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

                  {userType === 'doctor' && (
                    <>
                      <div>
                        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                          Specialty
                        </label>
                        <Select
                          value={formData.specialty}
                          onValueChange={(value) => setFormData({ ...formData, specialty: value })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty.toLowerCase()}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="qualification" className="sr-only">Qualification</label>
                        <input
                          id="qualification"
                          name="qualification"
                          type="text"
                          required
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                          placeholder="Qualification (e.g., MBBS, MD)"
                          value={formData.qualification}
                          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="experience" className="sr-only">Years of Experience</label>
                        <input
                          id="experience"
                          name="experience"
                          type="number"
                          required
                          min="0"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                          placeholder="Years of Experience"
                          value={formData.experience}
                          onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="licenseNumber" className="sr-only">Medical License Number</label>
                        <input
                          id="licenseNumber"
                          name="licenseNumber"
                          type="text"
                          required
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                          placeholder="Medical License Number"
                          value={formData.licenseNumber}
                          onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="clinicAddress" className="sr-only">Clinic Address</label>
                        <input
                          id="clinicAddress"
                          name="clinicAddress"
                          type="text"
                          required
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                          placeholder="Clinic Address"
                          value={formData.clinicAddress}
                          onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                        />
                      </div>

                      <div>
                        <label htmlFor="consultationFee" className="sr-only">Consultation Fee</label>
                        <input
                          id="consultationFee"
                          name="consultationFee"
                          type="number"
                          required
                          min="0"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                          placeholder="Consultation Fee"
                          value={formData.consultationFee}
                          onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="phone" className="sr-only">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            )}

            <div className="relative flex items-center">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-md block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 pr-12 z-10"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex items-center text-gray-400 hover:text-indigo-600 focus:outline-none bg-transparent border-none p-0 m-0"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                {typeof Eye !== 'undefined' && typeof EyeOff !== 'undefined' ? (
                  showPassword ? <EyeOff size={20} /> : <Eye size={20} />
                ) : (
                  <EyeIcon visible={showPassword} />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            className="text-indigo-600 hover:text-pink-500 font-medium transition"
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                userType: 'patient',
                specialty: '',
                qualification: '',
                experience: '',
                licenseNumber: '',
                clinicAddress: '',
                consultationFee: ''
              });
            }}
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth; 