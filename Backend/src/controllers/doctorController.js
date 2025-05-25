import Doctor from '../models/doctor.js';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Error fetching doctor' });
  }
};

// Create new doctor
export const createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Error creating doctor' });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    // Allow updating specific fields including customizations
    const allowedUpdates = [
      'name', 'specialization', 'experience', 'rating', 'image',
      'customImage', 'description', 'education', 'languages',
      'achievements', 'consultationFee', 'isAvailable', 'availability'
    ];

    // Filter out any fields that aren't in allowedUpdates
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Error updating doctor' });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};

// Update doctor image
export const updateDoctorImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          customImage: `/uploads/doctor-images/${req.file.filename}`
        }
      },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error('Error updating doctor image:', error);
    res.status(500).json({ message: 'Error updating doctor image' });
  }
};

// Component rendering doctors
const DoctorList = ({ doctors }) => (
  <div>
    {doctors.map(doctor => (
      <div key={doctor._id}>{doctor.name}</div>
    ))}
  </div>
);

export default DoctorList;