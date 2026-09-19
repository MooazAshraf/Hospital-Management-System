const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const Patient = require("../models/patient.model");
const publicUser = (user) => {
  const value = user.toObject ? user.toObject() : { ...user };
  delete value.password;
  return value;
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Lightweight directory endpoint: id + name + role only.
// Used by non-admin roles (e.g. patients viewing their own medical reports)
// to resolve who a patient/doctor is without exposing email/phone/etc.
// Full user records (getUsers) stay restricted to doctor/admin.
const getUsersBasic = async (req, res) => {
  try {
    const users = await User.find().select("name role").sort({ name: 1 });
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isOwner = String(user._id) === String(req.user.userId);
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You are not allowed to view this account" });
    }

    res.status(200).json({ success: true, message: "User fetched successfully", user });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid user id" });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const addUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create User
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      role: "user",
    });

    // Every "user" role account needs a matching Patient profile — medical
    // reports, appointments, etc. are keyed off it. If this fails, roll the
    // User creation back rather than leaving an account with no profile
    // (which silently breaks "my medical reports" for that account).
    try {
      await Patient.create({ user: user._id, name, email, phone });
    } catch (patientError) {
      await User.findByIdAndDelete(user._id);
      throw patientError;
    }

    res.status(201).json({
      success: true,
      message: "User and patient profile created successfully",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("addUser error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const updateUserData = async (req, res) => {
  try {
    const isOwner = String(req.params.id) === String(req.user.userId);
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "You are not allowed to update this account" });
    }

    const { password, role, isActive, ...otherData } = req.body;

    if (role !== undefined) {
      if (!isAdmin) return res.status(403).json({ success: false, message: "Only an admin can change roles" });
      if (!["user", "doctor", "admin"].includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role" });
      }
      otherData.role = role;
    }

    if (isActive !== undefined) {
      if (!isAdmin) return res.status(403).json({ success: false, message: "Only an admin can change account status" });
      otherData.isActive = isActive;
    }

    if (otherData.email) otherData.email = String(otherData.email).toLowerCase();
    if (password) otherData.password = await bcrypt.hash(password, 12);

    const user = await User.findByIdAndUpdate(req.params.id, otherData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Email already exists" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid user id" });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.userId)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own admin account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid user id" });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const userLogin = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) return res.status(401).json({ success: false, message: "Invalid email or password" });

    if (!user.isActive) return res.status(403).json({ success: false, message: "Your account is inactive" });

    user.lastLoginDate = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: String(user._id), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!["doctor", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "role must be either 'doctor' or 'admin'" });
    }

    const existingUser = await User.findOne({ email: String(email || "").toLowerCase() });
    if (existingUser) return res.status(409).json({ success: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword, phone, role });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Email already exists" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getUsers,
  getUsersBasic,
  getUserById,
  addUser,
  updateUserData,
  deleteUser,
  userLogin,
  createStaffAccount,
};