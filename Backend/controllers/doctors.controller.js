const doctorModel = require("../models/doctors.model");
const userModel = require("../models/users.model");

// Get all doctors - any authenticated user (patients need to browse doctors too)
const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find()
      .populate("user", "name email role");

    res.status(200).json({
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get a single doctor by ID - any authenticated user
const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorModel
      .findById(req.params.id)
      .populate("user", "name email role");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      message: "Doctor fetched successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a doctor profile - the doctor themselves, or an admin on their behalf
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      specialty,
      department,
      email,
      phone,
      description,
      fees,
      qualifications,
      roomNumber,
      experienceYears,
      isAvailable,
      availability,
      image,
      user, // only used when an admin creates the profile
    } = req.body;

    const isAdmin = req.user.role === "admin";

    // A doctor creates their own profile; an admin must specify which user account
    const targetUserId = isAdmin ? user : req.user.userId;

    if (!targetUserId) {
      return res.status(400).json({
        message: "user id is required when an admin creates a doctor profile",
      });
    }

    // Make sure the target account actually has the "doctor" role
    const targetUser = await userModel.findById(targetUserId);
    if (!targetUser || targetUser.role !== "doctor") {
      return res.status(400).json({
        message: "The linked account must be a registered doctor account",
      });
    }

    // One doctor profile per user account
    const existingDoctorForUser = await doctorModel.findOne({
      user: targetUserId,
    });

    if (existingDoctorForUser) {
      return res.status(409).json({
        message: "This account already has a doctor profile",
      });
    }

    // Check if email already exists
    const existingEmail = await doctorModel.findOne({ email });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const newDoctor = await doctorModel.create({
      user: targetUserId,
      name,
      specialty,
      department,
      email,
      phone,
      description,
      fees,
      qualifications,
      roomNumber,
      experienceYears,
      isAvailable,
      availability,
      image,
    });

    const doctor = await doctorModel
      .findById(newDoctor._id)
      .populate("user", "name email role");

    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a doctor - the doctor themselves, or an admin
const updateDoctor = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    const isOwner = doctor.user.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this doctor record",
      });
    }

    // Only an admin can move a doctor profile to a different user account
    const updateData = { ...req.body };
    if (!isAdmin) {
      delete updateData.user;
    }

    const updatedDoctor = await doctorModel
      .findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate("user", "name email role");

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a doctor - admin only
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await doctorModel.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  addDoctor,
  updateDoctor,
  deleteDoctor,
};
