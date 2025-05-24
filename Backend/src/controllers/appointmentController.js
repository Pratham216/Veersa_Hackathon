import Appointment from '../models/appointment.js';

// Get all appointments for a user
export const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Error fetching appointment' });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const appointment = new Appointment({
      ...req.body,
      userId: req.user.id
    });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};
