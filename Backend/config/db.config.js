const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.DB_LINK) throw new Error("DB_LINK is missing");
  await mongoose.connect(process.env.DB_LINK);
  console.log("Connected to MongoDB");
};

module.exports = { connectDB };
