const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  patientName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  prescriptionFile: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);