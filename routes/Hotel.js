// Router for Hotel
const express = require("express");
const multer = require("../utils/multer");
const router = express.Router();
const hotelController = require("../controllers/hotelController");

router.get("/search/:city", hotelController.hotel_search_index);
router.get("/new", hotelController.hotel_new_get);
router.post("/", hotelController.hotel_new_post);
router.get("/image/new", hotelController.hotel_new_image_get);
router.post(
  "/image",
  multer.upload_multiple,
  hotelController.hotel_new_image_post
);
router.get("/:id", hotelController.hotel_detail_get);
router.get("/:id/edit", hotelController.hotel_edit_get);
module.exports = router;
