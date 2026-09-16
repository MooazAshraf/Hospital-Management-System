const { body, validationResult } = require("express-validator");

const createDoctorValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters")
    .isLength({ max: 50 })
    .withMessage("Name cannot exceed 50 characters"),

  body("specialty").trim().notEmpty().withMessage("Specialty is required"),

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
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^01[0125][0-9]{8}$/)
    .withMessage("Please enter a valid Egyptian phone number"),

  body("fees")
    .notEmpty()
    .withMessage("Fees are required")
    .isFloat({ min: 0 })
    .withMessage("Fees must be a positive number"),

  body("experienceYears")
    .notEmpty()
    .withMessage("Years of experience are required")
    .isInt({ min: 0 })
    .withMessage("Experience years must be a positive integer"),

  body("qualifications")
    .optional()
    .isArray()
    .withMessage("Qualifications must be an array"),

  body("availability")
    .optional()
    .isArray()
    .withMessage("Availability must be an array"),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { createDoctorValidationRules, validate };
