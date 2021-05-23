const auth_login = (req, res) => {
  res.status(200).render("auth/registerform");
};

module.exports = {
  auth_login,
};
