import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { getCurrentLocation, findNearbyHospitals } from "@/services/locationService";

interface Hospital {
  properties: {
    name: string;
    address_line1: string;
    phone: string;
    distance: number;
  };
  geometry: {
    coordinates: [number, number];
  };
}

const EmergencyServices = () => {
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);

  useEffect(() => {
    // Get initial location when component mounts
    if (!userLocation) {
      handleGetLocation();
    }
  }, []);

  const handleGetLocation = async () => {
    try {
      const position = await getCurrentLocation();
      setUserLocation(position);
      await fetchNearbyHospitalsWithLocation(position);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
      setLoading(false);
    }
  };

  const fetchNearbyHospitalsWithLocation = async (position: GeolocationPosition) => {
    setLoading(true);
    setError(null);
    try {
      const nearbyHospitals = await findNearbyHospitals(
        position.coords.latitude,
        position.coords.longitude
      );
      setHospitals(nearbyHospitals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch hospitals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft size={20} />
          </Link>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Find Emergency Services</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGetLocation}
              disabled={loading}
              className="mb-4"
            >
              <MapPin className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Find Nearby Hospitals'}
            </Button>

            {error && (
              <div className="text-red-500 mb-4">
                Error: {error}
              </div>
            )}

            {hospitals.length > 0 && (
              <div className="space-y-4">
                {hospitals.map((hospital, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h3 className="font-bold">{hospital.properties.name}</h3>
                      <p className="text-sm text-gray-600">
                        {hospital.properties.address_line1}
                      </p>
                      {hospital.properties.phone && (
                        <a 
                          href={`tel:${hospital.properties.phone}`}
                          className="flex items-center text-blue-600 mt-2"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          {hospital.properties.phone}
                        </a>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Distance: {(hospital.properties.distance / 1000).toFixed(1)} km
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EmergencyServices;
