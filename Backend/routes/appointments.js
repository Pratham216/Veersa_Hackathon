const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  doctorName: { type: String, required: true },
  specialization: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  patientName: { type: String, required: true },
  phone: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{9,14}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  email: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  reason: { type: String, required: true },
  symptoms: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  payment: {
    amount: { 
      type: Number, 
      required: true,
      validate: {
        validator: function(v) {
          return v > 0;
        },
        message: props => `Payment amount must be greater than 0!`
      }
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    },
    transactionId: { type: String },
    paymentMethod: { type: String }
  }
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Get all appointments for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching appointments for user:', req.user.id);
    const appointments = await Appointment.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    console.log(`Found ${appointments.length} appointments`);
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Get a specific appointment
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('Fetching appointment:', req.params.id);
    const appointment = await Appointment.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Error fetching appointment', error: error.message });
  }
});

// Create a new appointment
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating appointment with data:', req.body);
    console.log('User ID from auth:', req.user);
    
    // Validate required fields
    const requiredFields = ['doctorName', 'specialization', 'date', 'time', 'patientName', 'phone', 'email', 'reason'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        message: 'Missing required fields', 
        errors: missingFields.map(field => ({
          field,
          message: `${field} is required`
        }))
      });
    }

    // Validate payment data
    if (!req.body.payment || typeof req.body.payment.amount !== 'number' || req.body.payment.amount <= 0) {
      console.log('Invalid payment data:', req.body.payment);
      return res.status(400).json({ 
        message: 'Invalid payment data', 
        errors: [{
          field: 'payment.amount',
          message: 'Payment amount is required and must be a positive number'
        }]
      });
    }

    // Convert doctorId to ObjectId if it exists
    let doctorId = null;
    if (req.body.doctorId) {
      try {
        doctorId = new mongoose.Types.ObjectId(req.body.doctorId);
      } catch (error) {
        console.error('Invalid doctorId format:', error);
        return res.status(400).json({
          message: 'Invalid doctorId format',
          errors: [{
            field: 'doctorId',
            message: 'Invalid doctor ID format'
          }]
        });
      }
    }

    // Create appointment with validated data
    const appointmentData = {
      ...req.body,
      userId: req.user.id,
      doctorId: doctorId,
      status: 'pending',
      payment: {
        amount: req.body.payment.amount,
        status: 'pending'
      }
    };

    console.log('Creating appointment with validated data:', appointmentData);

    const appointment = new Appointment(appointmentData);
    
    // Run validation before saving
    const validationError = appointment.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.entries(validationError.errors).map(([field, error]) => ({
          field,
          message: error.message
        }))
      });
    }

    const savedAppointment = await appointment.save();
    console.log('Appointment created successfully:', savedAppointment);
    res.status(201).json(savedAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.entries(error.errors).map(([field, err]) => ({
          field,
          message: err.message
        }))
      });
    }

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid data format',
        errors: [{
          field: error.path,
          message: `Invalid ${error.path} format`
        }]
      });
    }

    res.status(500).json({ 
      message: 'Error creating appointment', 
      error: error.message 
    });
  }
});

// Update appointment payment status
router.post('/:id/payment', auth, async (req, res) => {
  try {
    console.log('Updating payment status for appointment:', req.params.id);
    console.log('Payment data:', req.body);

    const { paymentMethod, transactionId } = req.body;
    
    if (!paymentMethod || !transactionId) {
      return res.status(400).json({ message: 'Payment method and transaction ID are required' });
    }

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        $set: {
          'payment.status': 'completed',
          'payment.paymentMethod': paymentMethod,
          'payment.transactionId': transactionId,
          'status': 'confirmed'
        }
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Payment status updated successfully:', appointment);
    res.json(appointment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(400).json({ message: 'Error updating payment status', error: error.message });
  }
});

// Update an appointment
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating appointment:', req.params.id);
    console.log('Update data:', req.body);

    // Don't allow direct payment updates through this route
    const updateData = { ...req.body };
    delete updateData.payment;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Appointment updated successfully:', appointment);
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    res.status(400).json({ message: 'Error updating appointment', error: error.message });
  }
});

// Delete an appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting appointment:', req.params.id);

    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    console.log('Appointment deleted successfully');
    res.json({success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, message: 'Error deleting appointment', error: error.message });
  }
});

module.exports = router; 