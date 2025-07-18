import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { LatLngTuple, Map as LeafletMap, PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;

// const GEOAPIFY_API_KEY = "ac185378194d4388acd495ad9941c0fc";

interface HospitalProperties {
  name?: string;
  address_line1?: string;
  city?: string;
  website?: string;
}

interface Hospital {
  properties: HospitalProperties;
  geometry: {
    coordinates: [number, number];
  };
}

interface LocationOption {
  name: string;
  lat: number;
  lon: number;
}

const locationOptions: LocationOption[] = [
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.3854, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  // NEW CITIES
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.648 },
];

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Emergency: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [usedIPFallback, setUsedIPFallback] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationOption | null>(null);
  const [nearbyHospitals, setNearbyHospitals] = useState<Hospital[]>([]);
  const [selectedHospitals, setSelectedHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [manualLocation, setManualLocation] = useState<{ lat: string; lon: string }>({ lat: '', lon: '' });

  // Add polyline style
  const polylineOptions: PathOptions = {
    color: 'blue',
    weight: 3,
    opacity: 0.7
  };

  const fetchHospitals = async (lat: number, lon: number, type: "nearby" | "selected") => {
    try {
      const url = `${BACKEND_URL}/api/geoapify/hospitals?lat=${lat}&lon=${lon}`;
      const res = await fetch(url);
      const data = await res.json();
      if (type === "nearby") {
        setNearbyHospitals(data.features || []);
      } else {
        setSelectedHospitals(data.features || []);
      }
    } catch (err) {
      setError("Error fetching hospitals.");
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/geoapify/reverse-geocode?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data && data.address) {
        const { suburb, city, town, village, state } = data.address;
        const name = suburb || city || town || village || state || "Unknown location";
        setLocationName(name);
      }
    } catch {
      setLocationName("Unknown location");
    }
  };

const fetchLocationByIP = async () => {
  try {
    console.log('Attempting IP-based location detection...');
    const response = await fetch(`${BACKEND_URL}/api/geoapify/ip-location`);
    const data = await response.json();
    if (data && data.location) {
      const loc = { lat: data.location.latitude, lon: data.location.longitude };
      console.log('IP-based location detected:', loc);
      setUsedIPFallback(true);
      setLocation(loc);
      setError(null); // Clear any previous errors
      fetchHospitals(loc.lat, loc.lon, "nearby");
      reverseGeocode(loc.lat, loc.lon);
    } else {
      console.log('IP location failed, using default location (Delhi)');
      // Use Delhi as default fallback
      const defaultLocation = { lat: 28.6139, lon: 77.2090 };
      setLocation(defaultLocation);
      setUsedIPFallback(true);
      setLocationName('Delhi (Default)');
      setError('Using default location (Delhi). You can manually select a different city below.');
      fetchHospitals(defaultLocation.lat, defaultLocation.lon, "nearby");
    }
  } catch (error) {
    console.log('IP location error, using default location (Delhi)');
    // Use Delhi as default fallback
    const defaultLocation = { lat: 28.6139, lon: 77.2090 };
    setLocation(defaultLocation);
    setUsedIPFallback(true);
    setLocationName('Delhi (Default)');
    setError('Using default location (Delhi). You can manually select a different city below.');
    fetchHospitals(defaultLocation.lat, defaultLocation.lon, "nearby");
  }
};

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let gpsAttempted = false;
    
    // Start with Delhi as default immediately to show something
    const defaultLocation = { lat: 28.6139, lon: 77.2090 };
    setLocation(defaultLocation);
    setLocationName('Delhi (Default)');
    fetchHospitals(defaultLocation.lat, defaultLocation.lon, "nearby");
    
    // Try to get better location in parallel
    if (navigator.geolocation) {
      gpsAttempted = true;
      
      // Set a quick timeout - if no location in 3 seconds, stick with default
      timeoutId = setTimeout(() => {
        console.log('Geolocation taking too long, keeping Delhi default');
        // Don't try IP fallback, just keep Delhi default
      }, 3000);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const loc = { lat: latitude, lon: longitude };
          console.log('GPS location detected:', loc);
          
          // Clear timeout since we got location
          clearTimeout(timeoutId);
          
          // Only update if we actually got GPS location (not IP)
          setLocation(loc);
          setError(null);
          setUsedIPFallback(false);
          fetchHospitals(loc.lat, loc.lon, "nearby");
          reverseGeocode(loc.lat, loc.lon);
        },
        (error) => {
          console.warn("Geolocation failed:", error.message);
          clearTimeout(timeoutId);
          
          // Don't use IP fallback - just keep Delhi default
          console.log('Keeping Delhi as default location instead of IP fallback');
        },
        { enableHighAccuracy: false, maximumAge: 300000, timeout: 3000 } // Fast, less accurate
      );
    }
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = locationOptions.find((loc) => loc.name === e.target.value);
    if (loc) {
      setSelectedLocation(loc);
      setLoading(true);
      fetchHospitals(loc.lat, loc.lon, "selected");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
            <ArrowLeft size={20} />
            <span className="ml-1">Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-blue-700">Emergency Services</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col items-center space-y-6">

      <Card className="w-full">

        <CardHeader>
          <CardTitle>Emergency Ambulance Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="mb-4 text-lg font-semibold">In case of emergency, contact an ambulance immediately.</p>
            <button
              className="bg-red-600 text-white py-2 px-4 rounded-full text-xl hover:bg-red-700 transition duration-300"
              onClick={() => alert("Dialing Emergency Ambulance...")}
            >
              Call Ambulance
            </button>
          </div>
        </CardContent>
        </Card>

          {/* Nearby Hospitals Card */}
          {/* Nearby Hospitals Card */}
          <Card className="w-full">

  <CardHeader>
    <CardTitle>Nearby Hospitals (Live Location)</CardTitle>
  </CardHeader>
  <CardContent>
    {locationName && (
      <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded">
        📍 <strong>Your current location:</strong> {locationName}
        {usedIPFallback && <p className="text-sm text-yellow-600 mt-1">* Location estimated via IP</p>}
      </div>
    )}
    {loading && <p>Loading hospitals...</p>}
    {error && (
      <div className="text-red-500 p-3 bg-red-50 border border-red-200 rounded">
        <p>{error}</p>
        <button
          onClick={() => setShowManualInput(true)}
          className="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          Enter location manually
        </button>
      </div>
    )}
    
    {showManualInput && (
      <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-semibold mb-2">Enter coordinates manually:</h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Latitude (e.g., 28.6139)"
            value={manualLocation.lat}
            onChange={(e) => setManualLocation({ ...manualLocation, lat: e.target.value })}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Longitude (e.g., 77.2090)"
            value={manualLocation.lon}
            onChange={(e) => setManualLocation({ ...manualLocation, lon: e.target.value })}
            className="p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mt-2 space-x-2">
          <button
            onClick={() => {
              const lat = parseFloat(manualLocation.lat);
              const lon = parseFloat(manualLocation.lon);
              if (lat && lon && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                setLocation({ lat, lon });
                setLoading(true);
                setError(null);
                setShowManualInput(false);
                fetchHospitals(lat, lon, "nearby");
                reverseGeocode(lat, lon);
              } else {
                alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search Hospitals
          </button>
          <button
            onClick={() => setShowManualInput(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: You can get your coordinates from Google Maps by right-clicking on your location.
        </p>
      </div>
    )}
    {!loading && !error && nearbyHospitals.length > 0 && location && (
      <MapContainer 
        center={[location.lat, location.lon] as LatLngTuple}
        zoom={13} 
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lon] as LatLngTuple}>
          <Popup>Your Location</Popup>
        </Marker>
        {nearbyHospitals.map((hospital, index) => {
          const [lon, lat] = hospital.geometry.coordinates;
          const dist = getDistanceFromLatLonInKm(location.lat, location.lon, lat, lon).toFixed(2);
          return (
            <React.Fragment key={index}>
              <Marker position={[lat, lon] as LatLngTuple}>
                <Popup>
                  <p className="font-semibold">{hospital.properties.name || "Unnamed Hospital"}</p>
                  <p>{hospital.properties.address_line1}</p>
                  <p>{hospital.properties.city}</p>
                  <p className="text-sm">🚗 Distance: {dist} km</p>
                  {hospital.properties.website && (
                    <a href={hospital.properties.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      Visit Website
                    </a>
                  )}
                </Popup>
              </Marker>
              <Polyline 
                positions={[[location.lat, location.lon], [lat, lon]] as LatLngTuple[]}
                pathOptions={polylineOptions}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>
    )}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nearbyHospitals.map((hospital, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h4 className="font-bold text-lg mb-2">{hospital.properties.name || "Unnamed Hospital"}</h4>
          <p className="text-gray-600">{hospital.properties.address_line1}</p>
          <p className="text-gray-600">{hospital.properties.city}</p>
          {hospital.properties.website && (
            <a href={hospital.properties.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block mt-2">
              Visit Website
            </a>
          )}
        </div>
      ))}
    </div>
  </CardContent>
</Card>

<Card className="w-full">

  <CardHeader>
    <CardTitle>Search by Location</CardTitle>
  </CardHeader>
  <CardContent>
    <select
      className="w-full p-2 border border-gray-300 rounded"
      onChange={handleLocationChange}
      value={selectedLocation?.name || ""}
    >
      <option value="">Select a Location</option>
      {locationOptions.map((loc) => (
        <option key={loc.name} value={loc.name}>
          {loc.name}
        </option>
      ))}
    </select>
    {selectedLocation && !loading && selectedHospitals.length > 0 && (
      <div className="mt-4">
        <MapContainer 
          center={[selectedLocation.lat, selectedLocation.lon] as LatLngTuple}
          zoom={13} 
          style={{ height: "400px", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[selectedLocation.lat, selectedLocation.lon] as LatLngTuple}>
            <Popup>Selected Location</Popup>
          </Marker>
          {selectedHospitals.map((hospital, index) => {
            const [lon, lat] = hospital.geometry.coordinates;
            const dist = getDistanceFromLatLonInKm(selectedLocation.lat, selectedLocation.lon, lat, lon).toFixed(2);
            return (
              <React.Fragment key={index}>
                <Marker position={[lat, lon] as LatLngTuple}>
                  <Popup>
                    <p className="font-semibold">{hospital.properties.name || "Unnamed Hospital"}</p>
                    <p>{hospital.properties.address_line1}</p>
                    <p>{hospital.properties.city}</p>
                    <p className="text-sm">🚗 Distance: {dist} km</p>
                    {hospital.properties.website && (
                      <a href={hospital.properties.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                        Visit Website
                      </a>
                    )}
                  </Popup>
                </Marker>
                <Polyline 
                  positions={[[selectedLocation.lat, selectedLocation.lon], [lat, lon]] as LatLngTuple[]}
                  pathOptions={polylineOptions}
                />
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>
    )}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {selectedHospitals.map((hospital, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <h4 className="font-bold text-lg mb-2">{hospital.properties.name || "Unnamed Hospital"}</h4>
          <p className="text-gray-600">{hospital.properties.address_line1}</p>
          <p className="text-gray-600">{hospital.properties.city}</p>
          {hospital.properties.website && (
            <a href={hospital.properties.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 block mt-2">
              Visit Website
            </a>
          )}
        </div>
      ))}
    </div>
  </CardContent>
</Card>

        </div>
      </main>
    </div>
  );
};

export default Emergency;
