import mongoose from 'mongoose';
import Doctor from '../models/doctor.js';
import dotenv from 'dotenv';

dotenv.config();

const generateAvailability = () => {
  const availability = [];
  const today = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip Sundays
    if (date.getDay() === 0) continue;
    
    const slots = [];
    // Generate slots from 9 AM to 5 PM
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    availability.push({
      date: date.toISOString().split('T')[0],
      slots
    });
  }
  
  return availability;
};

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialization: "Cardiology",
    experience: "15 years",
    rating: 4.8,
    image: "https://img.freepik.com/free-photo/woman-doctor-wearing-lab-coat-with-stethoscope-isolated_1303-29791.jpg",
    description: "Dr. Sarah Johnson is a renowned cardiologist with extensive experience in treating complex cardiac conditions.",
    education: "MD in Cardiology, Harvard Medical School",
    languages: ["English", "Spanish"],
    achievements: ["Best Cardiologist Award 2022", "Published 15+ research papers"],
    consultationFee: 800,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Michael Chen",
    specialization: "Neurology",
    experience: "12 years",
    rating: 4.9,
    image: "https://img.freepik.com/free-photo/portrait-smiling-male-doctor_171337-1532.jpg",
    description: "Dr. Michael Chen specializes in neurological disorders and has pioneered several innovative treatment methods.",
    education: "MD in Neurology, Johns Hopkins University",
    languages: ["English", "Mandarin", "Cantonese"],
    achievements: ["Neurological Research Excellence Award", "Pioneer in Brain-Computer Interface Research"],
    consultationFee: 900,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Emily Rodriguez",
    specialization: "Pediatrics",
    experience: "10 years",
    rating: 4.7,
    image: "https://img.freepik.com/free-photo/female-doctor-hospital-with-stethoscope_23-2148827776.jpg",
    description: "Dr. Emily Rodriguez is a compassionate pediatrician dedicated to providing comprehensive care for children.",
    education: "MD in Pediatrics, Stanford University",
    languages: ["English", "Spanish", "Portuguese"],
    achievements: ["Child Care Excellence Award", "Youth Health Ambassador"],
    consultationFee: 600,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. James Wilson",
    specialization: "Orthopedics",
    experience: "18 years",
    rating: 4.9,
    image: "https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-5790.jpg",
    description: "Dr. James Wilson is an expert in sports medicine and complex orthopedic surgeries.",
    education: "MD in Orthopedics, Yale University",
    languages: ["English"],
    achievements: ["Sports Medicine Innovation Award", "Olympic Team Doctor 2020"],
    consultationFee: 850,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Priya Patel",
    specialization: "Dermatology",
    experience: "8 years",
    rating: 4.6,
    image: "https://img.freepik.com/free-photo/indian-female-doctor-white-coat-with-stethoscope-around-neck_123827-21773.jpg",
    description: "Dr. Priya Patel is known for her expertise in cosmetic dermatology and skin cancer treatment.",
    education: "MD in Dermatology, University of California",
    languages: ["English", "Hindi", "Gujarati"],
    achievements: ["Young Dermatologist Award", "Skin Cancer Research Grant Recipient"],
    consultationFee: 700,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. David Kim",
    specialization: "Psychiatry",
    experience: "14 years",
    rating: 4.8,
    image: "https://img.freepik.com/free-photo/portrait-successful-mid-adult-doctor-with-crossed-arms_1262-12865.jpg",
    description: "Dr. David Kim is a psychiatrist specializing in anxiety, depression, and trauma therapy.",
    education: "MD in Psychiatry, Columbia University",
    languages: ["English", "Korean"],
    achievements: ["Mental Health Advocacy Award", "Published author on PTSD treatment"],
    consultationFee: 750,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Sofia Martinez",
    specialization: "Gynecology",
    experience: "13 years",
    rating: 4.9,
    image: "https://img.freepik.com/free-photo/female-doctor-posing-hospital_23-2148827775.jpg",
    description: "Dr. Sofia Martinez is a leading gynecologist specializing in women's health and reproductive medicine.",
    education: "MD in Gynecology, University of Barcelona",
    languages: ["English", "Spanish", "Catalan"],
    achievements: ["Women's Health Excellence Award", "Pioneer in Minimally Invasive Surgery"],
    consultationFee: 800,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Alexander Wright",
    specialization: "Oncology",
    experience: "20 years",
    rating: 4.9,
    image: "https://img.freepik.com/free-photo/handsome-young-male-doctor-with-stethoscope-standing-against-blue-background_662251-337.jpg",
    description: "Dr. Wright is a renowned oncologist with expertise in innovative cancer treatments and clinical research.",
    education: "MD in Oncology, Memorial Sloan Kettering",
    languages: ["English", "French"],
    achievements: ["Cancer Research Excellence Award", "Leading Clinical Trials Researcher"],
    consultationFee: 950,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Aisha Khan",
    specialization: "Endocrinology",
    experience: "11 years",
    rating: 4.7,
    image: "https://img.freepik.com/free-photo/female-doctor-hospital_23-2148827775.jpg",
    description: "Dr. Khan specializes in hormonal disorders and diabetes management with a holistic approach.",
    education: "MD in Endocrinology, King's College London",
    languages: ["English", "Urdu", "Arabic"],
    achievements: ["Diabetes Care Innovation Award", "Thyroid Research Grant Recipient"],
    consultationFee: 750,
    isAvailable: true,
    availability: generateAvailability()
  },
  {
    name: "Dr. Robert Anderson",
    specialization: "Pulmonology",
    experience: "16 years",
    rating: 4.8,
    image: "https://img.freepik.com/free-photo/medium-shot-doctor-with-crossed-arms_23-2148868141.jpg",
    description: "Dr. Anderson is an expert in respiratory medicine and sleep disorders with extensive ICU experience.",
    education: "MD in Pulmonology, Mayo Clinic",
    languages: ["English", "German"],
    achievements: ["Respiratory Care Excellence Award", "COVID-19 Research Contributor"],
    consultationFee: 800,
    isAvailable: true,
    availability: generateAvailability()
  }
];

const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya-vritti');
    console.log('Connected to MongoDB');

    // Clear existing doctors
    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    // Insert new doctors
    await Doctor.insertMany(doctors);
    console.log('Successfully seeded doctors');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

seedDoctors(); 