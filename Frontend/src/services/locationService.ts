import axios from 'axios';

// ✅ Dynamically set backend base URL from Vite environment
const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/geoapify`;

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(new Error(`Geolocation error: ${error.message}`)),
      options
    );
  });
};

export const findNearbyHospitals = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(`${BASE_URL}/hospitals`, {
      params: {
        lat: latitude,
        lon: longitude
      }
    });
    return response.data.features || [];
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    throw new Error('Failed to fetch nearby hospitals. Please try again.');
  }
};