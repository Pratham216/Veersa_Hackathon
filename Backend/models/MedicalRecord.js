const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bloodType: { 
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: true
  },
  allergies: { 
    type: String,
    default: ''
  },
  chronicConditions: { 
    type: String,
    default: ''
  },
  medications: { 
    type: String,
    default: ''
  },
  familyHistory: { 
    type: String,
    default: ''
  },
  surgeries: { 
    type: String,
    default: ''
  },
  lifestyle: {
    smoking: { 
      type: String,
      enum: ['never', 'occasional', 'regular', 'former', ''],
      default: ''
    },
    alcohol: { 
      type: String,
      enum: ['none', 'occasional', 'moderate', 'heavy', ''],
      default: ''
    },
    exercise: { 
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', ''],
      default: ''
    },
    diet: { 
      type: String,
      enum: ['regular', 'vegetarian', 'vegan', 'keto', 'paleo', 'other', ''],
      default: ''
    }
  },
  healthMetrics: [{
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
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    date: { type: Date, required: true }
  }],
  reports: [{
    fileName: String,
    fileType: String,
    fileUrl: String,
    uploadDate: Date,
    description: String,
    reportType: {
      type: String,
      enum: ['lab', 'imaging', 'prescription', 'other']
    }
  }]
}, { timestamps: true });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

module.exports = MedicalRecord; 