import express from 'express';
import {
  getUserAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getUserAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
