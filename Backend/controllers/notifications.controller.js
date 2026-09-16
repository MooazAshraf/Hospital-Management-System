const notificationModel = require("../models/notifications.models");

const getMyNotifications = async (req, res) => {
  try {
    const filter = { recipient: req.user.userId };

    // Optional: /api/notifications?unread=true
    if (req.query.unread === "true") {
      filter.isRead = false;
    }

    const notifications = await notificationModel
      .find(filter)
      .populate("sender", "name role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Notifications fetched successfully",
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const getNotificationById = async (req, res) => {
  try {
    const notification = await notificationModel
      .findById(req.params.id)
      .populate("sender", "name role");

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const isOwner = notification.recipient.toString() === req.user.userId;

    if (!isOwner) {
      return res.status(403).json({
        message: "You are not allowed to view this notification",
      });
    }

    res.status(200).json({
      message: "Notification fetched successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const createNotification = async (req, res) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      relatedAppointment,
      relatedMedicalReport,
    } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({
        message: "recipient, title and message are required",
      });
    }

    const notification = await notificationModel.create({
      recipient,
      sender: req.user.userId,
      type,
      title,
      message,
      relatedAppointment,
      relatedMedicalReport,
    });

    res.status(201).json({
      message: "Notification created successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
const markAsRead = async (req, res) => {
  try {
    const notification = await notificationModel.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const isOwner = notification.recipient.toString() === req.user.userId;

    if (!isOwner) {
      return res.status(403).json({
        message: "You are not allowed to update this notification",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany(
      { recipient: req.user.userId, isRead: false },
      { $set: { isRead: true } },
    );

    res.status(200).json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await notificationModel.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const isOwner = notification.recipient.toString() === req.user.userId;

    if (!isOwner) {
      return res.status(403).json({
        message: "You are not allowed to delete this notification",
      });
    }

    await notificationModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
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
