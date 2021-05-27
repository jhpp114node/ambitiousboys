const express = require("express");
const router = express.Router();
const searchHotelController = require("../controllers/searchHotelController");

router.get("/:city/:id", searchHotelController.hotel_search_view_detail_db);
router.get(
  "/:city/:id/covid/:countryCode",
  searchHotelController.covid_api_get
);
router.get("/:city/:id/video/:cityname", searchHotelController.video_api_get);
module.exports = router;
