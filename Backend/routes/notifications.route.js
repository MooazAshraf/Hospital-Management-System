const express = require("express");

const { authenticate } = require("../middlewares/isLogged");

const {
  getMyNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notifications.controller");

const notificationRouter = express.Router();

// All notification routes require a logged-in user
notificationRouter.use(authenticate);

// Get my notifications (?unread=true to filter)
notificationRouter.get("/", getMyNotifications);

// Mark all my notifications as read
notificationRouter.patch("/read-all", markAllAsRead);

// Get a single notification (owner only)
notificationRouter.get("/:id", getNotificationById);

// Create a notification for another user (e.g. doctor -> patient)
notificationRouter.post("/", createNotification);

// Mark one notification as read (owner only)
notificationRouter.patch("/:id/read", markAsRead);

// Delete a notification (owner only)
notificationRouter.delete("/:id", deleteNotification);

module.exports = {
  notificationRouter,
};
