const express = require("express");
const router = express.Router();
const searchHotelController = require("../controllers/searchHotelController");

router.get("/:city/:id", searchHotelController.hotel_search_view_detail_db);

module.exports = router;
