const mongoose = require("../utils/db");

const hotelSchema = mongoose.mongoose.Schema(
  {
    fullname: String,
    city: String,
    _score: Number,
    label: String,
    address: String,
    is_hotel_api: Boolean,
    api_hotel_id: String,
    full_city_name: String,
    imageUrls: [
      {
        type: String,
      },
    ],
    user: {
      type: mongoose.mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.mongoose.model("Hotel", hotelSchema);
