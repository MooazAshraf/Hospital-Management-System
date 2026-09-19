const express = require("express");

const { authenticate } =
  require("../middlewares/isLogged");

const { authorize } =
  require("../middlewares/authorize");

const {
  getMyNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notifications.controller");

const notificationRouter =
  express.Router();


// ==========================================
// Authentication required for all routes
// ==========================================
notificationRouter.use(authenticate);


// ==========================================
// Get current user's notifications
// GET /api/notifications
// ==========================================
notificationRouter.get(
  "/",
  getMyNotifications
);


// ==========================================
// Mark all as read
// PATCH /api/notifications/read-all
// ==========================================
notificationRouter.patch(
  "/read-all",
  markAllAsRead
);


// ==========================================
// Get notification by ID
// GET /api/notifications/:id
// ==========================================
notificationRouter.get(
  "/:id",
  getNotificationById
);


// ==========================================
// Mark one notification as read
// PATCH /api/notifications/:id/read
// ==========================================
notificationRouter.patch(
  "/:id/read",
  markAsRead
);


// ==========================================
// Delete notification
// DELETE /api/notifications/:id
// ==========================================
notificationRouter.delete(
  "/:id",
  deleteNotification
);


// ==========================================
// Create notification
// POST /api/notifications
// Doctor/Admin only
// ==========================================
notificationRouter.post(
  "/",
  authorize("doctor", "admin"),
  createNotification
);


module.exports = {
  notificationRouter,
};