// Router for Authentication (Login / Register)
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
router.get("/register", authController.auth_register_get);
router.post("/register", authController.auth_register_post);
router.get("/login", authController.auth_login_get);
module.exports = router;
