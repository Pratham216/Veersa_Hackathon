import User from '../models/user.js';

export const getAllPatients = async (req, res) => {
  try {
    const patients = await User.find({ usertype: "patient" });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients" });
  }
};