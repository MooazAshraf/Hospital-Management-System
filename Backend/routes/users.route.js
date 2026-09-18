const express = require("express");

const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");

const {
  registerValidationRules,
  validate,
} = require("../middlewares/registerValidation");

const {
  getUsers,
  getUserById,
  addUser,
  updateUserData,
  deleteUser,
  userLogin,
  createStaffAccount,
} = require("../controllers/users.controller");

const userRouter = express.Router();

// Get all users - authenticated users only
userRouter.get("/", authenticate, authorize("doctor", "admin"), getUsers);

// Login
userRouter.post("/login", userLogin);

// Get user by ID - authenticated users only
userRouter.get("/:id", authenticate, getUserById);

// Register / Add user (public - always creates role "user")
userRouter.post("/register", registerValidationRules, validate, addUser);

// Create doctor/admin account - admin only
userRouter.post("/staff", authenticate, authorize("admin"), createStaffAccount);

// Update user - the user themselves, or an admin (checked inside controller)
userRouter.put("/:id", authenticate, updateUserData);

// Delete user - admin only
userRouter.delete("/:id", authenticate, authorize("admin"), deleteUser);

module.exports = {
  userRouter,
};
