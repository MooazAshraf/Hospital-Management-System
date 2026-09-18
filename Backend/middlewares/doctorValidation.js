const { body, validationResult } = require("express-validator");

const createDoctorValidationRules = [
  body("user")
    .optional()
    .isMongoId()
    .withMessage("Invalid user id"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("specialty")
    .trim()
    .notEmpty()
    .withMessage("Specialty is required")
    .isLength({ max: 100 })
    .withMessage("Specialty cannot exceed 100 characters"),

  body("department")
    .notEmpty()
    .withMessage("Department is required")
    .isMongoId()
    .withMessage("Invalid department id"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),

  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage("Please enter a valid Egyptian phone number"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("fees")
    .notEmpty()
    .withMessage("Fees are required")
    .isFloat({ min: 0 })
    .withMessage("Fees must be a positive number"),

  body("experienceYears")
    .notEmpty()
    .withMessage("Years of experience are required")
    .isInt({ min: 0 })
    .withMessage(
      "Experience years must be a positive integer"
    ),

  body("qualifications")
    .optional()
    .isArray()
    .withMessage("Qualifications must be an array"),

  body("qualifications.*")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage(
      "Each qualification must be between 2 and 100 characters"
    ),

  body("roomNumber")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Room number cannot exceed 20 characters"),

  body("isAvailable")
    .optional()
    .isBoolean()
    .withMessage("isAvailable must be a boolean"),

  body("availability")
    .optional()
    .isArray()
    .withMessage("Availability must be an array"),

  body("availability.*.day")
    .optional()
    .isIn([
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
    ])
    .withMessage("Invalid availability day"),

  body("availability.*.startTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Start time must be in HH:MM format"),

  body("availability.*.endTime")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("End time must be in HH:MM format"),

  body("image")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Image URL cannot exceed 500 characters"),
];


const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};


module.exports = {
  createDoctorValidationRules,
  validate,
};