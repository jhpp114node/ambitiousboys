// Router for Authentication (Login / Register)
const express = require("express");
const session = require("express-session");
const { authenticate } = require("passport");
const router = express.Router();
const passport = require("passport");

// passport
require("../passport/passport_google");
const authController = require("../controllers/authController");
router.get("/register", authController.auth_register_get);
router.post("/register", authController.auth_register_post);
router.get("/login", authController.auth_login_get);
router.post("/login", authController.auth_login_post);
router.get("/logout", authController.auth_logout);
// Google Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/google/failed" }),
  function (req, res) {
    req.session.user = {
      user: req.user,
    };
    //this will be different in locale in the JSON data
    res.redirect("/auth/google/good");
  }
);
// end of Google Auth
router.get("/google/login", authController.google_login);
router.get("/google/good", authController.google_login_good);
module.exports = router;
