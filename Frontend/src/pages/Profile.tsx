import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Link } from "react-router-dom";
import PeriodTracker from "@/components/PeriodTracker";
import { ArrowLeft, User, Settings, Shield, Droplet } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_PROFILE_PHOTO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23d1d5db'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

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

const Profile = () => {
  const { profileData, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  
  useEffect(() => {
    const loadProfileData = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          const normalizedData = {
            ...parsedData,
            profilePhoto: parsedData.profilePhoto || DEFAULT_PROFILE_PHOTO,
            name: parsedData.name || '',
            email: parsedData.email || '',
            phone: parsedData.phone || '',
            address: parsedData.address || '',
            dateOfBirth: parsedData.dateOfBirth || '',
            gender: parsedData.gender || '',
            bloodGroup: parsedData.bloodGroup || '',
            emergencyContact: parsedData.emergencyContact || ''
          };
          setFormData(normalizedData);
          updateProfile(normalizedData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    loadProfileData();

    const handleProfileUpdate = (event: CustomEvent<any>) => {
      const updatedData = event.detail;
      setFormData(prev => ({
        ...prev,
        ...updatedData,
        profilePhoto: updatedData.profilePhoto || DEFAULT_PROFILE_PHOTO
      }));
    };

    window.addEventListener('profileUpdated', handleProfileUpdate as EventListener);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate as EventListener);
    };
  }, [updateProfile]);

  useEffect(() => {
    if (profileData && Object.keys(profileData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...profileData,
        profilePhoto: profileData.profilePhoto || DEFAULT_PROFILE_PHOTO
      }));
    }
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);
    
    if (!isEditing) {
      updateProfile(updatedData);
      localStorage.setItem('user', JSON.stringify(updatedData));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedData }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);
    
    if (!isEditing) {
      updateProfile(updatedData);
      localStorage.setItem('user', JSON.stringify(updatedData));
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedData }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedData = {
      ...formData,
      profilePhoto: formData.profilePhoto || DEFAULT_PROFILE_PHOTO
    };

    updateProfile(updatedData);
    localStorage.setItem('user', JSON.stringify(updatedData));

    window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updatedData }));

    setIsEditing(false);
    toast("Profile Updated", {
      description: "Your profile information has been saved.",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft size={20} />
            <span className="ml-1">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-blue-700">Profile & Settings</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="profile" className="flex items-center">
              <User size={16} className="mr-2" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield size={16} className="mr-2" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="period" className="flex items-center">
              <Droplet size={16} className="mr-2 text-pink-500" />
              <span>Period Tracking</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings size={16} className="mr-2" />
              <span>Preferences</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and emergency contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
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
                        value={formData.bloodGroup}
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
                      <Label htmlFor="address">Address</Label>
                      <Input 
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input 
                        id="emergencyContact"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6 space-x-4">
                    {isEditing ? (
                      <>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsEditing(false);
                          setFormData(profileData);
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input type="password" id="current-password" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input type="password" id="new-password" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input type="password" id="confirm-password" />
                      </div>
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="period">
            <PeriodTracker />
          </TabsContent>
          
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>User Preferences</CardTitle>
                <CardDescription>
                  Customize your app experience and notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Add preference settings here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
