const Notification = require("../models/notifications.models");

const getMyNotifications = async (req, res) => {
  try {
    const filter = { recipient: req.user.userId };
    if (req.query.unread === "true") filter.isRead = false;

    const notifications = await Notification.find(filter)
      .populate("sender", "name role")
      .populate("relatedAppointment")
      .populate("relatedMedicalReport")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch notifications", error: error.message });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate("sender", "name role")
      .populate("relatedAppointment")
      .populate("relatedMedicalReport");

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    const owner = String(notification.recipient) === String(req.user.userId);
    if (!owner && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid notification id" });
    res.status(500).json({ success: false, message: "Failed to fetch notification", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { $set: { isRead: true } },
      { new: true },
    );

    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark notification as read", error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, isRead: false },
      { $set: { isRead: true } },
    );
    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to mark notifications as read", error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const result = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.userId,
    });
    if (!result) return res.status(404).json({ success: false, message: "Notification not found" });

    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete notification", error: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type = "system", sender = req.user.userId, relatedAppointment, relatedMedicalReport } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({ success: false, message: "recipient, title and message are required" });
    }

    const notification = await Notification.create({
      recipient,
      sender,
      title,
      message,
      type,
      relatedAppointment: relatedAppointment || null,
      relatedMedicalReport: relatedMedicalReport || null,
    });

    res.status(201).json({ success: true, message: "Notification created successfully", notification });
  } catch (error) {
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: "Validation failed", error: error.message });
    res.status(500).json({ success: false, message: "Failed to create notification", error: error.message });
  }
};

module.exports = {
  getMyNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
