// Router for Hotel
const express = require("express");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

router.get("/search/:city", hotelController.hotel_search_index);
router.get("/new", hotelController.hotel_new_post);
module.exports = router;
