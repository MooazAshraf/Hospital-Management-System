const express = require("express");

const {
  getAllMidicines,
  getMidicineById,
  createMidicine,
  updateMidicine,
  deleteMidicine,
} = require("../controllers/midicine.controller");

const midicineRouter = express.Router();

// Get all medicines
midicineRouter.get("/", getAllMidicines);

// Get medicine by ID
midicineRouter.get("/:id", getMidicineById);

// Create medicine
midicineRouter.post("/", createMidicine);

// Update medicine
midicineRouter.put("/:id", updateMidicine);

// Delete medicine
midicineRouter.delete("/:id", deleteMidicine);

module.exports = {
  midicineRouter,
};