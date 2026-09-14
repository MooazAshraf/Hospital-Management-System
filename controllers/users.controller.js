const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/users.model");

// ==========================
// Get All Users
// ==========================
const getUsers = async (req, res) => {
  try {
    const users = await userModel.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================
// Get User By ID
// ==========================
const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ==========================
// Add User / Register
// ==========================
const addUser = async (req, res) => {
  try {
    const { name, email, password, phone} = req.body;

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    // Don't return password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update User
const updateUserData = async (req, res) => {
  try {
    const isOwner = req.params.id === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You are not allowed to update this account",
      });
    }

    const { password, role, isActive, ...otherData } = req.body;

    // Only an admin can change these two fields, on anyone's account
    if (isAdmin) {
      if (role !== undefined) otherData.role = role;
      if (isActive !== undefined) otherData.isActive = isActive;
    }

    // If user wants to update password
    if (password) {
      otherData.password = await bcrypt.hash(password, 10);
    }

    const user = await userModel
      .findByIdAndUpdate(req.params.id, otherData, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email only
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account is inactive",
      });
    }

    // Update last login
    user.lastLoginDate = new Date();
    await user.save();

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    // Don't send password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create Staff Account (admin only - doctor/admin accounts)
const createStaffAccount = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!["doctor", "admin"].includes(role)) {
      return res.status(400).json({
        message: "role must be either 'doctor' or 'admin'",
      });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role,
    });

    res.status(201).json({
      message: `${role} account created successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  updateUserData,
  deleteUser,
  userLogin,
  createStaffAccount,
};
