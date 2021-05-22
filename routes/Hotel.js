// Router for Hotel
const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

router.get("/search/:city", hotelController.hotel_search_index);

module.exports = router;
