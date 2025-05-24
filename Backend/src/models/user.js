import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  profilePhoto: String,
  address: String,
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  emergencyContact: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);