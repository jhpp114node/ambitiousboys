const session = require("express-session");
const User = require("../models/user");
// get route
const account_get = (req, res) => {
  res.status(200).render("account/user");
};

module.exports = {
  account_get,
};
