const Department = require("../models/department.model");

const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    if (error.name === "ValidationError")
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({
      name: 1,
    });
    res
      .status(200)
      .json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllDepartmentsAdmin = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res
      .status(200)
      .json({ success: true, count: departments.length, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Department fetched successfully",
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    if (error.name === "ValidationError")
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: error.message,
      });
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    res
      .status(200)
      .json({ success: true, message: "Department deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDepartment,
  getAllDepartments,
  getAllDepartmentsAdmin,
  updateDepartment,
  deleteDepartment,
  getDepartmentById,
};
