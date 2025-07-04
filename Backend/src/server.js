import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/userRoutes.js' // Importing users router
// import paymentRoutes from './routes/payment.js';
import medicalRoutes from './routes/medicalRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import geoapifyRoutes from './routes/geoapifyRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import healthMetricsRoutes from './routes/medical/healthMetrics.js';

// Load environment variables
dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:5173', // Vite's default development port
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080', // Adding your current frontend port
  'http://localhost:8081', // Adding your current frontend port
  'http://localhost:8082', // Adding current frontend port
  'http://localhost:8083', // Adding your current frontend port
  'https://arogya-vritti-front-end.onrender.com',
  'https://arogya-vritti.life',
  'https://www.arogya-vritti.life',
  'https://veersa-hackathon.vercel.app', // ✅ Add this
  'https://veersa-hackathon-1qjh.onrender.com',
];
app.get("/", (req, res) => {
  res.send("Backend is live 🎉");
});

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya-vritti')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes); // Mounting users router
app.use('/api/auth', authRoutes);
// app.use('/api/payment', paymentRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/geoapify', geoapifyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical/health-metrics', healthMetricsRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));