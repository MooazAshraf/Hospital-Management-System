const notificationModel = require("../models/notifications.models");


// =====================================================
// Get My Notifications
// =====================================================

const getMyNotifications = async (req, res) => {
  try {
    const filter = {
      recipient: req.user.userId,
    };

    if (req.query.unread === "true") {
      filter.isRead = false;
    }

    const notifications = await notificationModel
      .find(filter)
      .populate("sender", "name role")
      .populate("relatedAppointment")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};


// =====================================================
// Get Notification
// =====================================================

const getNotificationById = async (req, res) => {
  try {
    const notification =
      await notificationModel
        .findById(req.params.id)
        .populate("sender", "name role")
        .populate("relatedAppointment");

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const isOwner =
      notification.recipient.toString() ===
      req.user.userId.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification",
    });
  }
};


// =====================================================
// Mark One As Read
// =====================================================

const markAsRead = async (req, res) => {
  try {
    const notification =
      await notificationModel.findOneAndUpdate(
        {
          _id: req.params.id,
          recipient: req.user.userId,
        },
        {
          $set: {
            isRead: true,
          },
        },
        {
          new: true,
        },
      );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};


// =====================================================
// Mark All As Read
// =====================================================

const markAllAsRead = async (req, res) => {
  try {
    await notificationModel.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      },
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};


// =====================================================
// Delete Notification
// =====================================================

const deleteNotification = async (req, res) => {
  try {
    const notification =
      await notificationModel.findOneAndDelete({
        _id: req.params.id,
        recipient: req.user.userId,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};


module.exports = {
  getMyNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};