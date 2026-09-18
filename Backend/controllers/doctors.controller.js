const doctorModel = require("../models/doctors.model");
const userModel = require("../models/users.model");
const bcrypt = require("bcrypt");
const Department = require("../models/department.model");


// ==========================================
// Get all doctors
// ==========================================

const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find()
      .populate("user", "name email role")
      .populate("department", "name");

    res.status(200).json({
      message: "Doctors fetched successfully",
      count: doctors.length,
      doctors,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// Get doctor by ID
// ==========================================

const getDoctorById = async (req, res) => {
  try {
    const doctor = await doctorModel
      .findById(req.params.id)
      .populate("user", "name email role")
      .populate("department", "name");

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


// ==========================================
// Get logged-in doctor's own profile
// ==========================================

const getMyDoctorProfile = async (req, res) => {
  try {

    const doctor = await doctorModel
      .findOne({ user: req.user.userId })
      .populate("user", "name email role")
      .populate("department", "name");

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor profile not found",
      });
    }

    res.status(200).json({
      message: "Doctor profile fetched successfully",
      doctor,
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// Create doctor profile
// ==========================================

const addDoctor = async (req, res) => {
  try {

    const {
      user,
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
    } = req.body;

    // A doctor can create their own profile. An admin can either
    // link an existing doctor account or create the account in one step.
    let targetUserId = req.user.userId;
    let createdUser = null;

    if (req.user.role === "admin" && user) {
      targetUserId = user;
    } else if (req.user.role === "admin" && !user) {
      const password = req.body.password;
      if (!password || String(password).length < 8) {
        return res.status(400).json({ message: "Password of at least 8 characters is required when creating a doctor account" });
      }

      const existingUser = await userModel.findOne({ email: String(email).toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "A user with this email already exists" });
      }

      createdUser = await userModel.create({
        name,
        email: String(email).toLowerCase(),
        password: await bcrypt.hash(password, 12),
        phone,
        role: "doctor",
      });
      targetUserId = createdUser._id;
    }

    const targetUser = await userModel.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({
        message: "User account not found",
      });
    }


    // User must have doctor role
    if (targetUser.role !== "doctor") {
      return res.status(400).json({
        message:
          "The linked account must be a registered doctor account",
      });
    }


    // One profile per user
    const existingDoctorForUser =
      await doctorModel.findOne({
        user: targetUserId,
      });

    if (existingDoctorForUser) {
      return res.status(409).json({
        message:
          "This account already has a doctor profile",
      });
    }


    // Email must be unique
    const existingEmail =
      await doctorModel.findOne({
        email: email.toLowerCase(),
      });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email already exists",
      });
    }


    let departmentId = department;
    if (department && !/^[0-9a-fA-F]{24}$/.test(String(department))) {
      const departmentDoc = await Department.findOne({
        name: { $regex: `^${String(department).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        isActive: true,
      });
      if (!departmentDoc) return res.status(404).json({ message: "Department not found" });
      departmentId = departmentDoc._id;
    }

    const newDoctor = await doctorModel.create({
      user: targetUserId,
      name,
      specialty,
      department: departmentId,
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
      .populate("user", "name email role")
      .populate("department", "name");


    res.status(201).json({
      message: "Doctor profile created successfully",
      doctor,
      user: createdUser
        ? { _id: createdUser._id, name: createdUser.name, email: createdUser.email, role: createdUser.role }
        : undefined,
    });

  } catch (error) {

    // Duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A doctor with this information already exists",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// Update doctor
// ==========================================

const updateDoctor = async (req, res) => {
  try {
    const doctor =
      await doctorModel.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }


    const isOwner =
      doctor.user.toString() === req.user.userId;

    const isAdmin =
      req.user.role === "admin";


    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You are not allowed to update this doctor record",
      });
    }


    const updateData = {
      ...req.body,
    };


    // Doctor cannot change linked user
    if (!isAdmin) {
      delete updateData.user;
    }


    // Admin changing linked user
    if (isAdmin && updateData.user) {

      const targetUser =
        await userModel.findById(updateData.user);

      if (!targetUser) {
        return res.status(404).json({
          message: "Target user account not found",
        });
      }


      if (targetUser.role !== "doctor") {
        return res.status(400).json({
          message:
            "The linked account must have doctor role",
        });
      }


      const existingProfile =
        await doctorModel.findOne({
          user: updateData.user,
          _id: { $ne: doctor._id },
        });

      if (existingProfile) {
        return res.status(409).json({
          message:
            "This account already has a doctor profile",
        });
      }
    }


    // Prevent duplicate email
    if (updateData.email) {

      const existingEmail =
        await doctorModel.findOne({
          email: updateData.email.toLowerCase(),
          _id: { $ne: doctor._id },
        });

      if (existingEmail) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }


    const updatedDoctor =
      await doctorModel
        .findByIdAndUpdate(
          req.params.id,
          updateData,
          {
            new: true,
            runValidators: true,
          }
        )
        .populate("user", "name email role")
        .populate("department", "name");


    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Duplicate doctor data",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// ==========================================
// Delete doctor
// ==========================================

const deleteDoctor = async (req, res) => {
  try {

    const doctor =
      await doctorModel.findByIdAndDelete(
        req.params.id
      );


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

const getDoctorsCount = async (req, res) => {
  try {
    const count = await doctorModel.countDocuments();
    res.status(200).json({ count });
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
  getMyDoctorProfile,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorsCount
};