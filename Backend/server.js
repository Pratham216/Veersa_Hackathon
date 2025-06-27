const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const healthMetricsRoutes = require('./routes/medical/healthMetrics');
const medicalRecordsRoutes = require('./routes/medical/records');
const medicalReportsRoutes = require('./routes/medical/reports');
const geolocationRoutes = require('./routes/geolocation');
const geolocationErrorHandler = require('./middleware/geolocationErrorHandler');

dotenv.config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:8084',
    'http://localhost:3000',
    'http://localhost:8085',
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083',
    'http://localhost:8085',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.get("/", (req, res) => {
  res.send("Backend is live 🎉");
});

app.use(cors(corsOptions));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/medical-reports', express.static(path.join(__dirname, 'uploads/medical-reports')));

// Database connection with more detailed error logging
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya-vritti', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB successfully');
  console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya-vritti');
})
.catch(err => {
  console.error('MongoDB connection error details:', {
    message: err.message,
    code: err.code,
    name: err.name,
    stack: err.stack
  });
  process.exit(1);
});

// Basic route for testing
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Test database operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        collections: collections.map(c => c.name)
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server health check failed',
      error: error.message
    });
  }
});

// Authentication error handler middleware
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: 'Invalid token or no token provided',
      error: err.message
    });
  }
  next(err);
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/medical/health-metrics', healthMetricsRoutes);
app.use('/api/medical/health-metric', healthMetricsRoutes); // Optional: support singular as well
app.use('/api/medical/records', medicalRecordsRoutes);
app.use('/api/medical/reports', medicalReportsRoutes); // <-- FIXED: mount at /api/medical/reports
app.use('/api/geoapify', geolocationRoutes);

// Remove duplicate or unnecessary recordsRouter mounting if present

// Add error handler after routes
app.use(geolocationErrorHandler);

// 404 handler
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    path: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      message: 'Database Error',
      error: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error'
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: PORT,
    mongoDbUri: (process.env.MONGODB_URI || 'mongodb://localhost:27017/arogya-vritti').split('@')[1] || 'local',
    corsOrigins: corsOptions.origin
  });
});