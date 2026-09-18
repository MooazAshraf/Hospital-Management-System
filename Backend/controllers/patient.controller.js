const Patient = require("../models/patient.model");
const User = require("../models/users.model");

const normalizeGender = (value) => {
  if (!value) return value;
  const normalized = String(value).toLowerCase();
  if (normalized === "male") return "Male";
  if (normalized === "female") return "Female";
  return value;
};

const getPatients = async (req, res) => {
  try {
    const patients = await Patient.find()
      .populate("user", "name email phone role isActive")
      .populate("primaryDoctor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      count: patients.length,
      patients,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate("user", "name email phone role isActive")
      .populate("primaryDoctor", "name email");

    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const ownerId = patient.user?._id || patient.user;
    const isOwner = String(ownerId) === String(req.user.userId);
    const staff = ["doctor", "admin"].includes(req.user.role);

    if (!isOwner && !staff) {
      return res.status(403).json({ success: false, message: "You are not allowed to view this patient record" });
    }

    res.status(200).json({ success: true, message: "Patient fetched successfully", patient });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid patient id" });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const addPatient = async (req, res) => {
  try {
    const {
      name, email, phone, password, gender, dateOfBirth, address, bloodGroup,
      allergies, chronicDiseases, emergencyContact, primaryDoctor,
    } = req.body;

    let targetUserId = req.user.userId;
    let createdUser = null;

    if (req.user.role === "admin") {
      if (!password || String(password).length < 8) {
        return res.status(400).json({ success: false, message: "A password of at least 8 characters is required when an admin creates a patient account" });
      }

      const existingUser = await User.findOne({ email: String(email).toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ success: false, message: "A user with this email already exists" });
      }

      const bcrypt = require("bcrypt");
      createdUser = await User.create({
        name,
        email: String(email).toLowerCase(),
        password: await bcrypt.hash(password, 12),
        phone,
        role: "user",
      });
      targetUserId = createdUser._id;
    } else if (req.user.role !== "user") {
      return res.status(403).json({ success: false, message: "Only patients or admins can create a patient profile" });
    }

    const existing = await Patient.findOne({ user: targetUserId });
    if (existing) return res.status(409).json({ success: false, message: "This account already has a patient profile" });

    const emailExists = await Patient.findOne({ email: String(email).toLowerCase() });
    if (emailExists) return res.status(409).json({ success: false, message: "Email already exists" });

    const patient = await Patient.create({
      user: targetUserId,
      name,
      email,
      phone,
      gender: normalizeGender(gender),
      dateOfBirth,
      address,
      bloodGroup,
      allergies,
      chronicDiseases,
      emergencyContact,
      primaryDoctor: req.user.role === "admin" ? primaryDoctor : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Patient profile created successfully",
      patient,
      user: createdUser ? { _id: createdUser._id, name: createdUser.name, email: createdUser.email, role: createdUser.role } : undefined,
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Patient profile already exists or email is already used" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    const isOwner = String(patient.user) === String(req.user.userId);
    const staff = ["doctor", "admin"].includes(req.user.role);

    if (!isOwner && !staff) {
      return res.status(403).json({ success: false, message: "You are not allowed to update this patient record" });
    }

    const updateData = { ...req.body };
    delete updateData.user;

    if (updateData.gender) updateData.gender = normalizeGender(updateData.gender);
    if (!staff) delete updateData.primaryDoctor;

    if (updateData.email) {
      updateData.email = String(updateData.email).toLowerCase();
      const emailExists = await Patient.findOne({
        email: updateData.email,
        _id: { $ne: patient._id },
      });
      if (emailExists) return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const updated = await Patient.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("user", "name email phone role isActive")
      .populate("primaryDoctor", "name email");

    // Keep the linked User's basic contact data synchronized for the owner.
    if (isOwner && updated?.user?._id) {
      const userUpdate = {};
      if (updateData.name !== undefined) userUpdate.name = updateData.name;
      if (updateData.email !== undefined) userUpdate.email = updateData.email;
      if (updateData.phone !== undefined) userUpdate.phone = updateData.phone;
      if (Object.keys(userUpdate).length) {
        await User.findByIdAndUpdate(updated.user._id, userUpdate, { runValidators: true });
      }
    }

    res.status(200).json({ success: true, message: "Patient updated successfully", patient: updated });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Email already exists" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found" });

    res.status(200).json({ success: true, message: "Patient deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid patient id" });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getMyPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.userId })
      .populate("user", "name email phone role isActive")
      .populate("primaryDoctor", "name email");

    res.status(200).json({
      success: true,
      exists: !!patient,
      patient: patient || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const saveMyPatientProfile = async (req, res) => {
  try {
    const {
      name, email, phone, gender, dateOfBirth, address, bloodGroup,
      allergies, chronicDiseases, emergencyContact,
    } = req.body;

    const normalizedEmail = email ? String(email).toLowerCase() : email;
    if (normalizedEmail) {
      const existing = await Patient.findOne({
        email: normalizedEmail,
        user: { $ne: req.user.userId },
      });
      if (existing) return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const updateData = {
      user: req.user.userId,
      name,
      email: normalizedEmail,
      phone,
      gender: normalizeGender(gender),
      dateOfBirth: dateOfBirth || undefined,
      address,
      bloodGroup: bloodGroup || undefined,
      allergies: allergies || [],
      chronicDiseases: chronicDiseases || [],
      emergencyContact,
    };

    const patient = await Patient.findOneAndUpdate(
      { user: req.user.userId },
      updateData,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).populate("user", "name email phone role isActive");

    await User.findByIdAndUpdate(
      req.user.userId,
      { name, email: normalizedEmail, phone },
      { new: true, runValidators: true },
    );

    res.status(200).json({ success: true, message: "Patient profile saved successfully", patient });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Email already exists" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getPatientsCount = async (req, res) => {
  try {
    const count = await Patient.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
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
  getPatientsCount,
};
