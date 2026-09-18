const Medicine = require("../models/midicine.model");

const getAllMidicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch medicines", error: error.message });
  }
};

const getMidicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
    res.status(200).json(medicine);
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid medicine id" });
    res.status(500).json({ success: false, message: "Failed to fetch medicine", error: error.message });
  }
};

const createMidicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, message: "Medicine created successfully", data: medicine });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Failed to create medicine", error: error.message });
  }
};

const updateMidicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
    res.status(200).json({ success: true, message: "Medicine updated successfully", data: medicine });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid medicine id" });
    res.status(500).json({ success: false, message: "Failed to update medicine", error: error.message });
  }
};

const deleteMidicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: "Medicine not found" });
    res.status(200).json({ success: true, message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete medicine", error: error.message });
  }
};

module.exports = { getAllMidicines, getMidicineById, createMidicine, updateMidicine, deleteMidicine };
