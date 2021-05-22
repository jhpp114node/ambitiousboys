// Router for Poster
const express = require("express");
const router = express.Router();
// const hotelController = require("../controllers/hotelController");

router.get("/home", (req, res) => {
  res.status(200).render("post/becomePoster");
});

module.exports = router;
