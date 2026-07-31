const express = require("express");
const { submitContact, getContacts, markRead, deleteContact } = require("../controllers/contact.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/contact",           submitContact);             // public
router.get("/contact",            adminMiddleware, getContacts);   // admin only
router.put("/contact/:id/read",   adminMiddleware, markRead);
router.delete("/contact/:id",     adminMiddleware, deleteContact);

module.exports = router;
