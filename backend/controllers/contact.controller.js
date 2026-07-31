const Contact = require("../models/contact.model");

// Try to load email service (non-critical)
let emailService = null;
try { emailService = require("../services/email.service"); } catch (_) {}

const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ message: "Name, email, and message are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    const contact = await Contact.create({ name: name.trim(), email: email.trim(), subject: subject?.trim() || "General Inquiry", message: message.trim() });

    // Non-blocking email notification
    if (emailService && process.env.SMTP_USER) {
      emailService.sendContactAck({ to: email, name, subject: subject || "General Inquiry" }).catch(() => {});
    }

    res.status(201).json({ success: true, message: "Your message has been received! We'll get back to you within 24 hours. 😊", contact });
  } catch (error) {
    console.error("submitContact error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!contact) return res.status(404).json({ message: "Message not found." });
    res.status(200).json({ message: "Marked as read", contact });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { submitContact, getContacts, markRead, deleteContact };
