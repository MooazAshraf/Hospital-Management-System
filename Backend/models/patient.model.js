const mongoose = require("mongoose");
require("./users.model");

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      trim: true,
    },

    email: {
  type: String,
  required: [true, "Email is required"],
  unique: true,
  lowercase: true,
  trim: true,
  match: [
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Please enter a valid email",
  ],
},

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^01[0125][0-9]{8}$/,
        "Please enter a valid Egyptian phone number",
      ],
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
    },

    dateOfBirth: {
      type: Date,
    },

    address: {
      street: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    allergies: {
      type: [String],
      default: [],
    },

    chronicDiseases: {
      type: [String],
      default: [],
    },

    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
        
      },
      relationship: {
        type: String,
        trim: true,
        
      },
    },

    primaryDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Patient", patientSchema);