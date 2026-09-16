require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userModel = require("../models/users.model");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.DB_LINK);

    const existingAdmin = await userModel.findOne({ email: "moazashraf@admin.com" });

    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("moaz123", 10);

    const admin = await userModel.create({
      name: "Moaz Admin",
      email: "moazashraf@admin.com",
      password: hashedPassword,
      phone: "01000000000",
      role: "admin",
    });

    console.log("Admin created successfully:");
    console.log("Email:", admin.email);
    console.log("Password: moaz123");

    process.exit(0);
  } catch (error) {
    console.log("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();