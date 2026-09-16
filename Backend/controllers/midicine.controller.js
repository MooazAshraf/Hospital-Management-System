const Midicine = require("../models/midicine.model");

// Get all medicines
const getAllMidicines = async (req, res, next) => {
  try {
    const midicines = await Midicine.find();
    res.status(200).json(midicines);
  } catch (error) {
    next(error);
  }
};

// Get medicine by ID
const getMidicineById = async (req, res, next) => {
  try {
    const midicine = await Midicine.findById(req.params.id);

    if (!midicine) {
      return res.status(404).json({
        message: "Midicine not found",
      });
    }

    res.status(200).json(midicine);
  } catch (error) {
    next(error);
  }
};

// Create medicine
const createMidicine = async (req, res, next) => {
  try {
    const midicine = await Midicine.create(req.body);

    res.status(201).json({
      message: "Midicine created successfully",
      data: midicine,
    });
  } catch (error) {
    next(error);
  }
};

// Update medicine
const updateMidicine = async (req, res, next) => {
  try {
    const midicine = await Midicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!midicine) {
      return res.status(404).json({
        message: "Midicine not found",
      });
    }

    res.status(200).json({
      message: "Midicine updated successfully",
      data: midicine,
    });
  } catch (error) {
    next(error);
  }
};

// Delete medicine
const deleteMidicine = async (req, res, next) => {
  try {
    const midicine = await Midicine.findByIdAndDelete(req.params.id);

    if (!midicine) {
      return res.status(404).json({
        message: "Midicine not found",
      });
    }

    res.status(200).json({
      message: "Midicine deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMidicines,
  getMidicineById,
  createMidicine,
  updateMidicine,
  deleteMidicine,
};