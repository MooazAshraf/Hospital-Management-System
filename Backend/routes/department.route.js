const express = require("express");

const router = express.Router();

const { authenticate } = require("../middlewares/isLogged");

const {
  createDepartment,
  getAllDepartments,
  updateDepartment,
} = require("../controllers/department.controller");

router
  .route("/")
  .get(getAllDepartments)
  .post(authenticate, createDepartment);

router
  .route("/:id")
  .put(authenticate, updateDepartment);

module.exports = router;