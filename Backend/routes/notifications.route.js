const express = require("express");
const { authenticate } = require("../middlewares/isLogged");
const { authorize } = require("../middlewares/authorize");
const {
  getMyNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notifications.controller");

const notificationRouter = express.Router();

notificationRouter.use(authenticate);
notificationRouter.get("/", getMyNotifications);
notificationRouter.patch("/read-all", markAllAsRead);
notificationRouter.get("/:id", getNotificationById);
notificationRouter.patch("/:id/read", markAsRead);
notificationRouter.delete("/:id", deleteNotification);
notificationRouter.post("/", authorize("doctor", "admin"), createNotification);

module.exports = { notificationRouter };
