const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const {
  createDepartment,
  getAllDepartments,
  getAllDepartmentsAdmin,
  updateDepartment,
  deleteDepartment,
  getDepartmentById,
} = require("../controllers/department.controller");

const router = express.Router();

router.get("/", getAllDepartments);
router.get("/:id", getDepartmentById);
router.get(
  "/admin/all",
  authenticate,
  authorize("admin"),
  getAllDepartmentsAdmin,
);
router.post("/", authenticate, authorize("admin"), createDepartment);
router.put("/:id", authenticate, authorize("admin"), updateDepartment);
router.delete("/:id", authenticate, authorize("admin"), deleteDepartment);

module.exports = router;
