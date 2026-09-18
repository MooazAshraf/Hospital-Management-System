require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
var cors = require("cors");

// Routes
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

const app = express();

app.use(
  cors({
    origin: "*",
  }),
);

app.options(/.*/, cors());

app.use(express.json());

app.use("/api/auditLogs", auditLogRouter);

// Users route
app.use("/api/users", userRouter);

// Medicine routes
app.use("/api/medicines", midicineRouter);

// Medical Reports route
app.use("/api/medicalReports", medicalReportsRouter);

// Appointment route
app.use("/api/appointments", appointmentRoutes);

// Patient route
app.use("/api/patients", patientRouter);

// Notifications route
app.use("/api/notifications", notificationRouter);

// Doctors route
app.use("/api/doctors", doctorRouter);

// Payments route
app.use("/api/payments", paymentRouter);

// Reviews route
app.use("/api/reviews", reviewRouter);

// Reviews route
app.use("/reviews", reviewRouter);

// payments route
app.use("/payments", paymentRouter);

mongoose
  .connect(process.env.DB_LINK)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
