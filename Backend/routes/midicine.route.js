const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const {
  getAllMidicines,
  getMidicineById,
  createMidicine,
  updateMidicine,
  deleteMidicine,
} = require("../controllers/midicine.controller");

const midicineRouter = express.Router();

midicineRouter.get("/", getAllMidicines);
midicineRouter.get("/:id", getMidicineById);
midicineRouter.post("/", authenticate, authorize("admin"), createMidicine);
midicineRouter.put("/:id", authenticate, authorize("admin"), updateMidicine);
midicineRouter.delete("/:id", authenticate, authorize("admin"), deleteMidicine);

module.exports = { midicineRouter };
