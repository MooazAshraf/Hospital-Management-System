const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/department.controller");

const router = express.Router();

router.get("/", getAllDepartments);
router.post("/", authenticate, authorize("admin"), createDepartment);
router.put("/:id", authenticate, authorize("admin"), updateDepartment);
router.delete("/:id", authenticate, authorize("admin"), deleteDepartment);

module.exports = router;
