require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { midicineRouter } = require("./routes/midicine.route");
const { medicalReportsRouter } = require("./routes/medicalReports.route");
const appointmentRoutes = require("./routes/appointment.route");
const { userRouter } = require("./routes/users.route");
const { patientRouter } = require("./routes/patient.route");
const { notificationRouter } = require("./routes/notifications.route");
const { doctorRouter } = require("./routes/doctors.route");
const reviewRouter = require("./routes/review.route");
const paymentRouter = require("./routes/payment.route");
const auditLogRouter = require("./routes/auditlog.route");
const departmentRouter = require("./routes/department.route");
const contactRouter = require("./routes/contact.route");

const app = express();

// =========================
// DISABLE CACHING FOR API RESPONSES
// =========================

app.set("etag", false);

app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// =========================
// CORS
// =========================

app.use(cors({ origin: "http://localhost:4200", credentials: true }));

// =========================
// BODY PARSER
// =========================

app.use(express.json({ limit: "1mb" }));

// =========================
// HEALTH CHECK
// =========================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "urCare API is running",
<<<<<<< HEAD
=======
    dbState: mongoose.connection.readyState,
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
  });
});

// =========================
// API ROUTES
// =========================

app.use("/api/users", userRouter);

app.use("/api/medicines", midicineRouter);

app.use("/api/medicalReports", medicalReportsRouter);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/patients", patientRouter);

app.use("/api/notifications", notificationRouter);

app.use("/api/doctors", doctorRouter);

app.use("/api/payments", paymentRouter);

app.use("/api/reviews", reviewRouter);

app.use("/api/departments", departmentRouter);

app.use("/api/auditLogs", auditLogRouter);

<<<<<<< HEAD
// Contact messages
app.use("/api/contact", contactRouter);

// Backward-compatible aliases used by older frontend code.
=======
// =========================
// BACKWARD COMPATIBILITY
// =========================

>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
app.use("/reviews", reviewRouter);

app.use("/payments", paymentRouter);

<<<<<<< HEAD
// 404 handler
=======
// =========================
// 404 HANDLER
// =========================

>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

<<<<<<< HEAD
// Error handler
app.use((error, _req, res, _next) => {
  console.error(error);
=======
// =========================
// GLOBAL ERROR HANDLER
// =========================

app.use((error, _req, res, _next) => {
  console.error("Server Error:", error);
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1

  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

// =========================
// MONGOOSE CONNECTION EVENTS
// =========================

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("[MongoDB] reconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("[MongoDB] connection error:", err.message);
});

// =========================
// SERVER
// =========================

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    if (!process.env.DB_LINK) {
      throw new Error("DB_LINK is missing in Backend/.env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in Backend/.env");
    }
<<<<<<< HEAD

    await mongoose.connect(process.env.DB_LINK);

=======

    mongoose.set("bufferCommands", false);

    await mongoose.connect(process.env.DB_LINK, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
    });

>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;