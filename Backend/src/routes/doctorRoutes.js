import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorImage
} from '../controllers/doctorController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/doctor-images/');
  },
  filename: function (req, file, cb) {
    cb(null, `doctor-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'));
    }
  }
});

// Public routes
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Protected routes (admin only)
router.post('/', auth, createDoctor);
router.put('/:id', auth, updateDoctor);
router.delete('/:id', auth, deleteDoctor);

// Image upload route
router.post('/:id/image', auth, upload.single('image'), updateDoctorImage);

export default router; 