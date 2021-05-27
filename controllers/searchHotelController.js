const s3 = require("../utils/s3");
const Hotel = require("../models/hotel");
const fetch = require("node-fetch");
require("dotenv").config();

// user search detail
const hotel_search_view_detail_db = async (req, res) => {
  const searchHotelId = req.params.id;
  try {
    const hotelDatafromDB = await Hotel.findById(searchHotelId);
    const hotelDatafromDBImage = hotelDatafromDB.imageUrls;
    const { trimLocation, checkin_date, checkout_date } =
      req.cookies["hotelSearchKeyword"];
    // res.clearCookie("hotelSearchKeyword");
    // call weather api 'cod' is being use for status code 200
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/weather?q=${trimLocation}&appid=${process.env.WEATHER_API_KEY}`;

    const weatherAPIFetch = await fetch(WEATHER_API_URL);
    const weatherAPIResponse = await weatherAPIFetch.json();
    if (weatherAPIResponse.cod !== 200) {
      throw Error("Weather API status is bad");
    }
    const imagesFromS3ForDetail = [];
    for (let i = 0; i < hotelDatafromDBImage.length; i++) {
      let param = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${hotelDatafromDBImage[i]}`,
      };
      let hotelImageDataS3 = await s3.s3.getObject(param).promise();
      let hotel_image = hotelImageDataS3.Body;
      let buffer = Buffer.from(hotel_image);
      let base64data = buffer.toString("base64");
      let imageDOM = "data:image/jpeg;base64," + base64data;
      imagesFromS3ForDetail.push(imageDOM);
    }
    const hotelDBSearchedDetail = {
      hotelDatafromDB: hotelDatafromDB,
      imagesFromS3ForDetail: imagesFromS3ForDetail,
      weatherAPIResponse: weatherAPIResponse,
      checkin_date: checkin_date,
      checkout_date: checkout_date,
    };
    return res.status(200).render("search/searchDetailDB", {
      hotelDBSearchedDetail: hotelDBSearchedDetail,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  hotel_search_view_detail_db,
};
