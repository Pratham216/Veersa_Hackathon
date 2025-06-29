import React, { createContext, useContext, useState, useEffect } from 'react';

// Import the default profile photo constant
const DEFAULT_PROFILE_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d1d5db'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  profilePhoto: string;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

interface ProfileContextType {
  profileData: UserProfileData;
  updateProfile: (data: UserProfileData) => void;
}

const defaultProfileData: UserProfileData = {
  name: '',
  email: '',
  phone: '',
  profilePhoto: DEFAULT_PROFILE_PHOTO,
  address: '',
  dateOfBirth: '',
  gender: '',
  bloodGroup: '',
  emergencyContact: ''
};

const ProfileContext = createContext<ProfileContextType>({
  profileData: defaultProfileData,
  updateProfile: () => {}
});

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profileData, setProfileData] = useState<UserProfileData>(defaultProfileData);

  // Function to ensure profile data has all required fields with defaults
  const normalizeProfileData = (data: Partial<UserProfileData>): UserProfileData => {
    return {
      ...defaultProfileData,
      ...data,
      profilePhoto: data.profilePhoto || DEFAULT_PROFILE_PHOTO
    };
  };

  useEffect(() => {
    // Load initial profile data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setProfileData(normalizeProfileData(parsedData));
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        setProfileData(defaultProfileData);
      }
    }

    // Listen for profile updates
    const handleProfileUpdate = (event: CustomEvent<UserProfileData>) => {
      setProfileData(normalizeProfileData(event.detail));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, []);

  const updateProfile = (data: UserProfileData) => {
    try {
      const normalizedData = normalizeProfileData(data);
      setProfileData(normalizedData);
      localStorage.setItem('user', JSON.stringify(normalizedData));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: normalizedData }));
    } catch (error) {
      console.error('Error updating profile context:', error);
    }
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext; 