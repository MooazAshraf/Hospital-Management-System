const notificationModel = require("../models/notifications.models");

const checkNotificationAccess = async (req, res, next) => {
  try {
    const notificationId = req.params.id;
    
   
    if (!notificationId) {
      return res.status(400).json({ success: false, message: "Notification ID is required" });
    }

    const notification = await notificationModel.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    const isOwner = notification.recipient.toString() === req.user.userId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. You are not allowed to perform this action on this notification." });
    }

   
    req.notification = notification;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkNotificationAccess,
};//-----------------------