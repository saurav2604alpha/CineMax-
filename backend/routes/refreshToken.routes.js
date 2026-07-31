const express = require("express");
const { newToken, logout } = require("../controllers/refreshToken.controller");

const router = express.Router();

router.post("/", newToken);
router.delete("/", logout);

module.exports = router;
