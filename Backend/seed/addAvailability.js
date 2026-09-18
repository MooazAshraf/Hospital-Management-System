require("dotenv").config();
const mongoose = require("mongoose");
const doctorModel = require("../models/doctors.model");

const defaultAvailability = [
  { day: "Saturday", startTime: "09:00", endTime: "17:00" },
  { day: "Sunday", startTime: "09:00", endTime: "17:00" },
  { day: "Monday", startTime: "09:00", endTime: "17:00" },
  { day: "Tuesday", startTime: "09:00", endTime: "17:00" },
  { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
  { day: "Thursday", startTime: "09:00", endTime: "17:00" },
];

async function run() {
  try {
    await mongoose.connect(process.env.DB_LINK);

    console.log("MongoDB connected");

    const doctors = await doctorModel.find({});

    console.log(`Found ${doctors.length} doctor(s) total.`);

    let updatedCount = 0;

    for (const doctor of doctors) {
      const hasAvailability =
        Array.isArray(doctor.availability) &&
        doctor.availability.length > 0;

      if (hasAvailability) {
        console.log(
          `Skipping ${doctor.name} - already has availability.`
        );
        continue;
      }

      doctor.availability = defaultAvailability;

      await doctor.save();

      updatedCount++;

      console.log(`Updated availability for ${doctor.name}.`);
    }

    console.log(`Done. Updated ${updatedCount} doctor(s).`);

    await mongoose.disconnect();

    process.exit(0);
  } catch (error) {
    console.error("Error seeding availability:", error);

    process.exit(1);
  }
}

run();