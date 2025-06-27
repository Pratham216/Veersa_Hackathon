import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react"; // Add this import

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/doctors`)
      .then(res => res.json())
      .then(data => {
        setDoctors(data);
        setLoading(false);
      });
  }, []);

  // Helper to render stars
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          fill={i <= rating ? "#facc15" : "none"}
        />
      );
    }
    return <span className="flex">{stars}</span>;
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-8 text-center">Our Doctors</h1>
        {loading ? (
          <div className="text-center text-lg text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {doctors.map((doctor: any) => (
              <Card key={doctor._id} className="shadow-lg hover:shadow-xl transition">
                <CardHeader>
                  <div className="flex flex-col items-center">
                    <img
                      src={doctor.image || "https://via.placeholder.com/100x100?text=Doctor"}
                      alt={doctor.name}
                      className="rounded-full h-24 w-24 object-cover mb-2 border-4 border-blue-100"
                    />
                    <CardTitle className="text-xl text-blue-800">{doctor.name}</CardTitle>
                    <div className="text-blue-500 font-medium">{doctor.specialization}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-700 mb-2 flex items-center gap-1">
                    <span className="font-semibold">Rating:</span>
                    {renderStars(Number(doctor.rating))}
                  </div>
                  <div className="text-gray-700 mb-2">
                    <span className="font-semibold">Experience:</span> {doctor.experience} years
                  </div>
                  {doctor.description && (
                    <div className="text-gray-600 mb-2">{doctor.description}</div>
                  )}
                  <div className="text-gray-700">
                    <span className="font-semibold">Consultation Fee:</span> ₹{doctor.consultationFee}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-semibold">Available:</span> {doctor.isAvailable ? "Yes" : "No"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;