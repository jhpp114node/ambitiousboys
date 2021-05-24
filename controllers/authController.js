const User = require("../models/user");
const bcrypt = require("bcryptjs");
const session = require("express-session");
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
    console.log(user);
  } catch (error) {
    console.error(error);
  }
  // if user does not exist then save it into the database
};

module.exports = {
  auth_register_get,
  auth_register_post,
};
