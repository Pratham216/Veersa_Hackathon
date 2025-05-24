const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get patient's appointments
router.get('/appointments', auth, async (req, res) => {
  try {
    // For now, returning mock data
    res.json([
      {
        id: '1',
        doctorName: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        date: '2024-03-30',
        time: '10:00 AM',
        status: 'scheduled'
      }
    ]);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Book appointment
router.post('/appointments', auth, async (req, res) => {
  try {
    const { doctorId, date, time, type } = req.body;
    
    // For now, just returning the created appointment
    // In a real app, you would save this to a database
    res.status(201).json({
      id: Date.now().toString(),
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date,
      time,
      type,
      status: 'scheduled'
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get medical records
router.get('/medical-records', auth, async (req, res) => {
  try {
    // For now, returning mock data
    res.json([
      {
        id: '1',
        date: '2024-03-15',
        doctorName: 'Dr. Sarah Johnson',
        diagnosis: 'Hypertension Stage 1',
        prescription: 'Amlodipine 5mg daily',
        notes: 'Blood pressure: 140/90 mmHg'
      }
    ]);
  } catch (error) {
    console.error('Get medical records error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get prescriptions
router.get('/prescriptions', auth, async (req, res) => {
  try {
    // For now, returning mock data
    res.json([
      {
        id: '1',
        date: '2024-03-15',
        doctorName: 'Dr. Sarah Johnson',
        medicines: 'Amlodipine 5mg',
        instructions: 'Take one tablet daily in the morning'
      }
    ]);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 