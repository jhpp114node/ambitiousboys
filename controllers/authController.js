const User = require("../models/user");
const bcrypt = require("bcryptjs");
const session = require("express-session");
// Register
const auth_register_get = (req, res) => {
  res.status(200).render("auth/registerform");
};

const auth_register_post = async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;
  console.log(username, email);
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    // check if the user email is already exist in the database
    const user = await User.findOne({ email: email }).exec();
    if (user === null) {
      // if user is not in database yet add
      const userRegisterData = {
        email: email,
        username: username,
        password: hashedPassword,
        isAdmind: false,
        image: null,
      };
      try {
        await User.create(userRegisterData);
        console.log("[Register]: add successfully");
        req.session.userRegisterStatusMessage =
          "Your account created successfully. Please login";
        res.redirect("/auth/login");
      } catch (addUserError) {
        console.error(`[Register]: fail to add user ${addUserError}`);
      }
    } else {
      // if user is already exist
      console.log("[Register]: user email already exist, please login");
      req.session.userRegisterStatusMessage =
        "Your account already exist. Please login.";
      res.redirect("/auth/login");
    }
    // console.log(user);
  } catch (error) {
    console.error(error);
  }
};

// Login
const auth_login_get = (req, res) => {
  if (req.session.userRegisterStatusMessage) {
    console.log(req.session.userRegisterStatusMessage);
    return res.status(200).render("auth/loginform", {
      registerStatusMessage: req.session.userRegisterStatusMessage,
    });
  }
  console.log(req.session.userRegisterStatusMessage);
  return res.status(200).render("auth/loginform", {
    registerStatusMessage: req.session.userRegisterStatusMessage,
  });
};
module.exports = {
  auth_register_get,
  auth_register_post,
  auth_login_get,
};
