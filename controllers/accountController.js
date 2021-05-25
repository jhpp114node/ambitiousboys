const session = require("express-session");
const User = require("../models/user");
const Hotel = require("../models/hotel");
// get route
const account_get = async (req, res) => {
  const user = req.session.user;
  try {
    const usersPostHotel = await Hotel.find({ user: { _id: user._id } });
    const userObject = {
      user: user,
      postedHotel: usersPostHotel,
    };
    return res.status(200).render("account/user", { userObject: userObject });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  account_get,
};
