import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  date: { type: String, required: true },
  slots: [{ type: String }]
});

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  experience: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  image: { type: String, required: true },
  customImage: { type: String }, // For custom uploaded images
  description: { type: String }, // For additional doctor description
  education: { type: String }, // For educational background
  languages: [{ type: String }], // Languages spoken
  achievements: [{ type: String }], // Notable achievements
  availability: [availabilitySchema],
  consultationFee: { type: Number, default: 500 }, // Consultation fee
  isAvailable: { type: Boolean, default: true }, // Doctor availability status
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
doctorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Doctor', doctorSchema); 