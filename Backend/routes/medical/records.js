const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const MedicalRecord = require('../../models/MedicalRecord');

// Get medical records for a user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching medical records for user:', req.user.id);
    const record = await MedicalRecord.findOne({ userId: req.user.id });
    console.log('Found record:', record);
    res.json(record || {});
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ 
      message: 'Error fetching medical records',
      error: error.message 
    });
  }
});

// Create or update medical records
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating/updating medical record for user:', req.user.id);
    console.log('Request body:', req.body);

    // Validate blood type if provided
    if (req.body.bloodType) {
      const validBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (!validBloodTypes.includes(req.body.bloodType)) {
        return res.status(400).json({
          message: 'Invalid blood type',
          validTypes: validBloodTypes
        });
      }
    }

    // Validate lifestyle fields if provided
    if (req.body.lifestyle) {
      const { smoking, alcohol, exercise, diet } = req.body.lifestyle;
      
      if (smoking && !['never', 'occasional', 'regular', 'former', ''].includes(smoking)) {
        return res.status(400).json({
          message: 'Invalid smoking status',
          validValues: ['never', 'occasional', 'regular', 'former', '']
        });
      }

      if (alcohol && !['none', 'occasional', 'moderate', 'heavy', ''].includes(alcohol)) {
        return res.status(400).json({
          message: 'Invalid alcohol consumption status',
          validValues: ['none', 'occasional', 'moderate', 'heavy', '']
        });
      }

      if (exercise && !['sedentary', 'light', 'moderate', 'active', ''].includes(exercise)) {
        return res.status(400).json({
          message: 'Invalid exercise level',
          validValues: ['sedentary', 'light', 'moderate', 'active', '']
        });
      }

      if (diet && !['regular', 'vegetarian', 'vegan', 'keto', 'paleo', 'other', ''].includes(diet)) {
        return res.status(400).json({
          message: 'Invalid diet type',
          validValues: ['regular', 'vegetarian', 'vegan', 'keto', 'paleo', 'other', '']
        });
      }
    }

    // Find and update or create new record
    const record = await MedicalRecord.findOneAndUpdate(
      { userId: req.user.id },
      { 
        ...req.body,
        userId: req.user.id 
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    console.log('Saved record:', record);
    res.json(record);
  } catch (error) {
    console.error('Error saving medical record:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({ 
      message: 'Error saving medical record',
      error: error.message 
    });
  }
});

module.exports = router; 