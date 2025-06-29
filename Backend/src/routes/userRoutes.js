console.log('=== users.js router loaded ===');
const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profiles';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Looking for user with id:', req.user.id);
    const user = await User.findById(req.user.id).select('-password');
    console.log('User found:', user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, upload.single('profilePhoto'), async (req, res) => {
  try {
    console.log('Profile update request received');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    console.log('File:', req.file);

    const updates = { ...req.body };
    delete updates.password; // Don't allow password updates through this route
    delete updates.email; // Don't allow email updates through this route

    // If a new photo was uploaded, add its path
    if (req.file) {
      updates.profilePhoto = `/uploads/profiles/${req.file.filename}`;
      console.log('New photo uploaded:', updates.profilePhoto);
    }

    // Update the updatedAt timestamp
    updates.updatedAt = new Date();

    console.log('Updates to apply:', updates);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      console.log('User not found with ID:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Updated user:', user);
    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    
    // Send more detailed error information
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        error: error.message,
        details: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update profile photo
router.put('/profile/photo', auth, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { profilePhoto: photoUrl } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.use((req, res, next) => {
  console.log('users.js catch-all:', req.method, req.originalUrl);
  next();
});

module.exports = router;