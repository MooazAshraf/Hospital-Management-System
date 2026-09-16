const mongoose = require("mongoose");

const connectDB = () => {
  mongoose
    .connect("DB_LINK")
    .then(() => console.log("Connected!"))
    .catch((err) => console.log("error from db", err));
};

module.exports = { connectDB };
