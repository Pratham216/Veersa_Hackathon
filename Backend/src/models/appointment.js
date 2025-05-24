import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  doctorName: { type: String, required: true },
  specialization: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  reason: { type: String, required: true },
  symptoms: { type: String, required: false },
  status: { 
    type: String, 
    enum: ['upcoming', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
appointmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Appointment', appointmentSchema);
