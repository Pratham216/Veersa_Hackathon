const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/medical-reports');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG and PNG are allowed.'));
    }
  }
});

// Simplified Medical Report Schema
const medicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileUrl: { type: String, required: true },
  description: { type: String, default: '' },
  reportType: { 
    type: String, 
    enum: ['lab', 'imaging', 'prescription', 'other'],
    default: 'other'
  },
  uploadDate: { type: Date, default: Date.now }
}, { timestamps: true });

const MedicalReport = mongoose.model('MedicalReport', medicalReportSchema);

// Get all medical reports for a user
router.get('/', auth, async (req, res) => {
  try {
    const reports = await MedicalReport.find({ userId: req.user.id })
      .sort({ uploadDate: -1 });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching medical reports:', error);
    res.status(500).json({ message: 'Error fetching medical reports', error: error.message });
  }
});

// Get a specific report
router.get('/:id', auth, async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical report', error: error.message });
  }
});

// Upload file endpoint
router.post('/upload', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File upload request:', {
      file: req.file,
      body: req.body,
      user: req.user.id
    });

    // Create a new medical report
    const report = new MedicalReport({
      userId: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileUrl: `/uploads/medical-reports/${req.file.filename}`,
      description: req.body.description || '',
      reportType: req.body.reportType || 'other',
      uploadDate: new Date()
    });

    // Save the report
    const savedReport = await report.save();
    console.log('Saved medical report:', savedReport);

    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ 
      message: 'Error uploading file', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Create a new medical report
router.post('/', auth, async (req, res) => {
  try {
    const report = new MedicalReport({
      ...req.body,
      userId: req.user.id
    });
    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: 'Error creating medical report', error: error.message });
  }
});

// Update a medical report
router.put('/:id', auth, async (req, res) => {
  try {
    const report = await MedicalReport.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: 'Error updating medical report', error: error.message });
  }
});

// Delete a medical report
router.delete('/:id', auth, async (req, res) => {
  try {
    const report = await MedicalReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!report) {
      return res.status(404).json({ message: 'Medical report not found' });
    }

    // Delete the file if it exists
    if (report.fileUrl) {
      const filePath = path.join(__dirname, '../../', report.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await report.deleteOne();
    res.json({ message: 'Medical report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting medical report', error: error.message });
  }
});

module.exports = router; 