require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/users.model");

const createAdmin = async () => {
  const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Hospital Admin";
  const phone = process.env.ADMIN_PHONE || "";

  if (!email || !password || !phone) {
    throw new Error("Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_PHONE in Backend/.env before running the seed script.");
  }

  if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters.");

  try {
    await mongoose.connect(process.env.DB_LINK);

    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`Admin already exists: ${email}`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "admin",
    });

    console.log(`Admin created successfully: ${email}`);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin().catch((error) => {
  console.error("Error creating admin:", error.message);
  process.exitCode = 1;
});
