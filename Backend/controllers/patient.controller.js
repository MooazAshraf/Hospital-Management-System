const patientModel = require("../models/patient.model");

// Get all patients - accessible to doctors and admins only
const getPatients = async (req, res) => {
  try {
    const patients = await patientModel
      .find()
      .populate("user", "name email role")
      .populate("primaryDoctor", "name email");

    res.status(200).json({
      message: "Patients fetched successfully",
      patients,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a single patient by ID - accessible to the patient themselves, or a doctor/admin

const getPatientById = async (req, res) => {
  try {
    const patient = await patientModel
      .findById(req.params.id)
      .populate("user", "name email role")
      .populate("primaryDoctor", "name email");

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const isOwner = patient.user._id.toString() === req.user.userId;
    const isDoctorOrAdmin =
      req.user.role === "doctor" || req.user.role === "admin";

    if (!isOwner && !isDoctorOrAdmin) {
      return res.status(403).json({
        message: "You are not allowed to view this patient record",
      });
    }

    res.status(200).json({
      message: "Patient fetched successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a new patient profile for the logged-in user
const addPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      bloodGroup,
      allergies,
      chronicDiseases,
      emergencyContact,
      primaryDoctor,
    } = req.body;

    // One patient profile per user account
    const existingPatientForUser = await patientModel.findOne({
      user: req.user.userId,
    });

    if (existingPatientForUser) {
      return res.status(409).json({
        message: "This account already has a patient profile",
      });
    }

    // Check if email already exists
    const existingEmail = await patientModel.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Create patient, tied to the logged-in user (not trusted from req.body)
    const patient = await patientModel.create({
      user: req.user.userId,
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      bloodGroup,
      allergies,
      chronicDiseases,
      emergencyContact,
      primaryDoctor,
    });

    res.status(201).json({
      message: "Patient profile created successfully",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a patient - accessible to the patient themselves, or a doctor/admin
const updatePatient = async (req, res) => {
  try {
    const patient = await patientModel.findById(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    const isOwner = patient.user.toString() === req.user.userId;
    const isDoctorOrAdmin =
      req.user.role === "doctor" || req.user.role === "admin";
    if (!isOwner && !isDoctorOrAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this patient record",
      });
    }

    // A patient shouldn't be able to reassign their own primary doctor or user link
    const updateData = { ...req.body };
    if (!isDoctorOrAdmin) {
      delete updateData.primaryDoctor;
      delete updateData.user;
    }

    const updatedPatient = await patientModel
      .findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate("user", "name email role")
      .populate("primaryDoctor", "name email");

    res.status(200).json({
      message: "Patient updated successfully",
      patient: updatedPatient,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a patient - accessible to doctors and admins only
const deletePatient = async (req, res) => {
  try {
    const patient = await patientModel.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({
        message: "Patient not found",
      });
    }

    res.status(200).json({
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await patientModel
      .findOne({ user: req.user.userId })
      .populate("user", "name email role")
      .populate("primaryDoctor", "name email");

    if (!patient) {
      return res.status(200).json({
        exists: false,
        patient: null,
      });
    }

    res.status(200).json({
      message: "Patient profile fetched successfully",
      patient,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        error: error.message,
      });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const saveMyPatientProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      bloodGroup,
      allergies,
      chronicDiseases,
      emergencyContact,
    } = req.body;

    // لو الإيميل ده مستخدم فعلاً من يوزر تاني (مش نفس صاحب البروفايل)
    if (email) {
      const existingEmail = await patientModel.findOne({
        email,
        user: { $ne: req.user.userId },
      });
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    const updateData = {
      name,
      email,
      phone,
      gender,
      dateOfBirth,
      address,
      bloodGroup,
      allergies,
      chronicDiseases,
      emergencyContact,
      user: req.user.userId,
    };

    const patient = await patientModel.findOneAndUpdate(
      { user: req.user.userId },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    res.status(200).json({
      message: "Patient profile saved successfully",
      patient,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getPatientsCount = async (req, res) => {
  try {
    const count = await patientModel.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  addPatient,
  updatePatient,
  deletePatient,
  getMyPatientProfile,
  saveMyPatientProfile,
  getPatientsCount
};
