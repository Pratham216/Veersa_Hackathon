const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');

// Health Metrics Schema
const healthMetricsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    required: true,
    enum: [
      'blood-pressure',
      'heart-rate',
      'blood-glucose',
      'oxygen-saturation',
      'body-temperature',
      'bmi',
      'hemoglobin',
      'cholesterol',
      'creatinine',
      'urea',
      'liver-enzymes',
      'thyroid'
    ]
  },
  value: { 
    type: Number,
    required: true 
  },
  unit: { type: String, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

const HealthMetric = mongoose.model('HealthMetric', healthMetricsSchema);

// Validation middleware
const validateHealthMetric = (req, res, next) => {
  const { type, value, unit, date } = req.body;

  if (!type || !value || !unit) {
    return res.status(400).json({
      message: 'Missing required fields',
      errors: [
        !type && { field: 'type', message: 'Type is required' },
        !value && { field: 'value', message: 'Value is required' },
        !unit && { field: 'unit', message: 'Unit is required' }
      ].filter(Boolean)
    });
  }

  // Validate value is a number
  if (isNaN(parseFloat(value))) {
    return res.status(400).json({
      message: 'Invalid value',
      errors: [{ field: 'value', message: 'Value must be a number' }]
    });
  }

  next();
};

// Get all health metrics for a user
router.get('/', auth, async (req, res) => {
  try {
    const metrics = await HealthMetric.find({ userId: req.user.id })
      .sort({ date: -1 });
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ message: 'Error fetching health metrics', error: error.message });
  }
});

// Get health metrics by type
router.get('/:type', auth, async (req, res) => {
  try {
    const metrics = await HealthMetric.find({ 
      userId: req.user.id,
      type: req.params.type 
    }).sort({ date: -1 });
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching health metrics:', error);
    res.status(500).json({ message: 'Error fetching health metrics', error: error.message });
  }
});

// Add new health metric
router.post('/', auth, validateHealthMetric, async (req, res) => {
  try {
    console.log('Received health metric data:', req.body);

    const metric = new HealthMetric({
      userId: req.user.id,
      type: req.body.type,
      value: parseFloat(req.body.value),
      unit: req.body.unit,
      date: req.body.date || new Date(),
      notes: req.body.notes
    });

    console.log('Created metric object:', metric);

    const savedMetric = await metric.save();
    console.log('Saved metric:', savedMetric);

    res.status(201).json(savedMetric);
  } catch (error) {
    console.error('Error adding health metric:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(400).json({ message: 'Error adding health metric', error: error.message });
  }
});

// Update health metric
router.put('/:id', auth, validateHealthMetric, async (req, res) => {
  try {
    const metric = await HealthMetric.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        type: req.body.type,
        value: parseFloat(req.body.value),
        unit: req.body.unit,
        date: req.body.date || new Date(),
        notes: req.body.notes
      },
      { new: true, runValidators: true }
    );
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    res.json(metric);
  } catch (error) {
    console.error('Error updating health metric:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    res.status(400).json({ message: 'Error updating health metric', error: error.message });
  }
});

// Delete health metric
router.delete('/:id', auth, async (req, res) => {
  try {
    const metric = await HealthMetric.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!metric) {
      return res.status(404).json({ message: 'Health metric not found' });
    }
    res.json({ message: 'Health metric deleted successfully' });
  } catch (error) {
    console.error('Error deleting health metric:', error);
    res.status(500).json({ message: 'Error deleting health metric', error: error.message });
  }
});

module.exports = router; 