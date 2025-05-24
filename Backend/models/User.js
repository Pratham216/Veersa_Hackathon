const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  // Common fields
  address: String,
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  emergencyContact: String,
  
  // Doctor specific fields
  specialty: {
    type: String,
    required: function() { return this.userType === 'doctor'; }
  },
  qualification: {
    type: String,
    required: function() { return this.userType === 'doctor'; }
  },
  experience: {
    type: String,
    required: function() { return this.userType === 'doctor'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.userType === 'doctor'; }
  },
  clinicAddress: {
    type: String,
    required: function() { return this.userType === 'doctor'; }
  },
  consultationFee: {
    type: String,
    required: function() { return this.userType === 'doctor'; }
  },
  
  // Patient specific fields
  medicalHistory: [{
    condition: String,
    diagnosis: String,
    treatment: String,
    date: Date
  }],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 