const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, default: 0 },
  image: { type: String },
  description: { type: String },
  education: { type: String, required: true },
  languages: [{ type: String }],
  achievements: [{ type: String }],
  consultationFee: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  availability: [{
    date: { type: String, required: true },
    slots: [{ type: String }]
  }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
});

// Get a specific doctor
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor', error: error.message });
  }
});

// Create a new doctor (protected route)
router.post('/', auth, async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const savedDoctor = await doctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    res.status(400).json({ message: 'Error creating doctor', error: error.message });
  }
});

// Update a doctor (protected route)
router.put('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: 'Error updating doctor', error: error.message });
  }
});

// Delete a doctor (protected route)
router.delete('/:id', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
});

// Update doctor availability
router.put('/:id/availability', auth, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: { availability: req.body.availability } },
      { new: true }
    );
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ message: 'Error updating doctor availability', error: error.message });
  }
});

module.exports = router;
