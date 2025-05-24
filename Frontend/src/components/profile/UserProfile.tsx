import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, User } from 'lucide-react';
import api from '@/services/api';
import { useProfile } from '@/contexts/ProfileContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Default profile photo URL
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

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' }
];

const bloodGroupOptions = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' }
];

const UserProfile: React.FC = () => {
  const { profileData: contextProfileData, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [localProfileData, setLocalProfileData] = useState<UserProfileData>({
    name: '',
    email: '',
    phone: '',
    profilePhoto: DEFAULT_PROFILE_PHOTO,
    address: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: ''
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Update local state when context data changes
  useEffect(() => {
    setLocalProfileData(prev => ({
      ...prev,
      ...contextProfileData,
      profilePhoto: contextProfileData.profilePhoto || DEFAULT_PROFILE_PHOTO
    }));
  }, [contextProfileData]);

  useEffect(() => {
    // Fetch the latest data from the server
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      const userData = response.data;
      updateProfile({
        ...userData,
        profilePhoto: userData.profilePhoto || DEFAULT_PROFILE_PHOTO
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Clean up previous preview URL if it exists
      if (localProfileData.profilePhoto && localProfileData.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(localProfileData.profilePhoto);
      }

      setPhotoFile(file);
      
      // Create a temporary preview URL
      const previewUrl = URL.createObjectURL(file);
      
      const updatedData = {
        ...localProfileData,
        profilePhoto: previewUrl
      };
      
      setLocalProfileData(updatedData);
      updateProfile(updatedData);
    }
  };

  // Add cleanup effect for preview URLs
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      if (localProfileData.profilePhoto && localProfileData.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(localProfileData.profilePhoto);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...localProfileData,
      [name]: value
    };
    setLocalProfileData(updatedData);
    if (!isEditing) {
      updateProfile(updatedData);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    const updatedData = {
      ...localProfileData,
      [name]: value
    };
    setLocalProfileData(updatedData);
    if (!isEditing) {
      updateProfile(updatedData);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      
      // Add all profile data except photo
      Object.entries(localProfileData).forEach(([key, value]) => {
        if (key !== 'profilePhoto' && value) {
          formData.append(key, value);
        }
      });
      
      // Handle photo upload
      if (photoFile) {
        formData.append('profilePhoto', photoFile);
      } else if (localProfileData.profilePhoto && localProfileData.profilePhoto !== DEFAULT_PROFILE_PHOTO) {
        formData.append('profilePhoto', localProfileData.profilePhoto);
      }

      const response = await api.put('/api/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Clean up any existing blob URL
      if (localProfileData.profilePhoto && localProfileData.profilePhoto.startsWith('blob:')) {
        URL.revokeObjectURL(localProfileData.profilePhoto);
      }

      // Update both local and context state with server response
      const updatedData = {
        ...response.data,
        profilePhoto: response.data.profilePhoto || DEFAULT_PROFILE_PHOTO
      };
      
      setLocalProfileData(updatedData);
      updateProfile(updatedData);
      
      // Reset the photo file state
      setPhotoFile(null);
      setIsEditing(false);

    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        {!isEditing ? (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Save Changes
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Profile Photo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={localProfileData.profilePhoto || DEFAULT_PROFILE_PHOTO}
                  alt={localProfileData.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = DEFAULT_PROFILE_PHOTO;
                  }}
                />
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                  <Camera className="w-4 h-4" />
                </label>
              )}
            </div>
            <div>
              <h3 className="font-medium">{localProfileData.name}</h3>
              <p className="text-sm text-gray-500">{localProfileData.email}</p>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={localProfileData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={localProfileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={localProfileData.gender}
                onValueChange={(value) => handleSelectChange('gender', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {genderOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select
                value={localProfileData.bloodGroup}
                onValueChange={(value) => handleSelectChange('bloodGroup', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroupOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={localProfileData.dateOfBirth}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                name="emergencyContact"
                value={localProfileData.emergencyContact}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={localProfileData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile; 