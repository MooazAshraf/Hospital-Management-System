const express = require("express");

const {
  authenticate,
} = require("../middlewares/isLogged");

const {
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notifications.controller");

const notificationRouter = express.Router();


// Authentication
notificationRouter.use(authenticate);


// Get notifications
notificationRouter.get(
  "/",
  getMyNotifications,
);


// Mark all read
notificationRouter.patch(
  "/read-all",
  markAllAsRead,
);


// Get one
notificationRouter.get(
  "/:id",
  getNotificationById,
);


// Mark one read
notificationRouter.patch(
  "/:id/read",
  markAsRead,
);


// Delete
notificationRouter.delete(
  "/:id",
  deleteNotification,
);


module.exports = {
  notificationRouter,
};