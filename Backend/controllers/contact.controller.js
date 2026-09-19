const ContactMessage = require("../models/contactMessage.model");

// ==========================================
// Create contact message
// ==========================================

const createContactMessage = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
    } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject and message are required",
      });
    }

    const newMessage = await ContactMessage.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      subject: String(subject).trim(),
      message: String(message).trim(),
      status: "New",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Create contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

// ==========================================
// Get all contact messages
// ==========================================

const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Contact messages fetched successfully",
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get contact messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
      error: error.message,
    });
  }
};

// ==========================================
// Get contact message by ID
// ==========================================

const getContactMessageById = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id).lean();

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message fetched successfully",
      data: message,
    });
  } catch (error) {
    console.error("Get contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message",
      error: error.message,
    });
  }
};

// ==========================================
// Update contact message status
// ==========================================

const updateContactMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "New",
      "Read",
      "Responded",
      "Resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message status",
      });
    }

    const updatedMessage =
      await ContactMessage.findByIdAndUpdate(
        req.params.id,
        { status },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message status updated successfully",
      data: updatedMessage,
    });
  } catch (error) {
    console.error("Update contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update contact message",
      error: error.message,
    });
  }
};

// ==========================================
// Delete contact message
// ==========================================

const deleteContactMessage = async (req, res) => {
  try {
    const deletedMessage =
      await ContactMessage.findByIdAndDelete(req.params.id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Delete contact message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
      error: error.message,
    });
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
  getContactMessageById,
  updateContactMessageStatus,
  deleteContactMessage,
};