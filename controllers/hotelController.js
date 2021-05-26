const s3 = require("../utils/s3");
const Hotel = require("../models/hotel");
const trimCity = require("../modules/trim_city_name");
// hotel_index
const fetch = require("node-fetch");
require("dotenv").config();
const hotel_search_index = async (req, res) => {
  //controller goes here
  const cityname = req.params.city;
  const HOTEL_API_URL = `http://engine.hotellook.com/api/v2/lookup.json?query=${cityname}&lang=en&lookFor=both&limit=5&token=${process.env.HOTEL_API_KEY}`;
  try {
    const fetchHotelData = await fetch(HOTEL_API_URL);
    const hotelData = await fetchHotelData.json();
    if (hotelData.status !== "ok" || hotelData.results.hotels.length === 0) {
      throw "API Status is bad";
    }
    // get correct country
    const fullCountryName = hotelData.results.locations[0].countryName;
    const filteredData = hotelData.results.hotels.filter((eachHotel) => {
      return eachHotel.locationName.indexOf(fullCountryName) >= 0;
    });
    console.log(filteredData);
    const renderDataObj = {
      searchedCity: cityname,
      apiGoogleMapGeoLocation: hotelData.results.locations[0],
      filteredData: filteredData,
    };
    res
      .status(200)
      .render("search/search.ejs", { renderDataObj: renderDataObj });
  } catch (error) {
    console.error(error);
  }
};
// blog_detail

// GET: hotel/new
const hotel_new_get = async (req, res) => {
  // console.log(req.session.user);
  let postingUser = req.session.user;
  return res.status(200).render("hotel/hotelAdd", { postingUser: postingUser });
};

// POST: hotel
const hotel_new_post = async (req, res) => {
  let postUserID = req.session.user.user_id;
  const { hotelLabel, hotelCity, hotel_location_street } = req.body;
  const trimmedCityName = trimCity(hotelCity);
  const fullname = hotelLabel + " " + hotelCity;
  // insert into database
  try {
    const user = {
      id: postUserID,
    };
    const hotelPostObj = {
      fullname: fullname,
      city: trimmedCityName,
      _score: 0,
      label: hotelLabel,
      address: hotel_location_street,
      is_hotel_api: false,
      api_hotel_id: null,
      imageUrls: null,
      user: user,
    };
    const createdHotel = await Hotel.create(hotelPostObj);
    console.log("[Post Hotel]: hotel had been created successfully");
    // console.log(createdHotel._id);
    req.session.hotelId = createdHotel._id;
    res.status(200).redirect("hotel/image/new");
  } catch (error) {
    console.error(error);
  }
};

const hotel_new_image_get = async (req, res) => {
  let hotelId = req.session.hotelId;
  console.log(hotelId);
  try {
    const findTargetHotel = await Hotel.findById(hotelId);
    if (findTargetHotel !== null) {
      // reset it to null
      req.session.hotelId = null;
      return res
        .status(200)
        .render("hotel/hotelImageAdd", { findTargetHotel: findTargetHotel });
    } else {
      throw Error("[Hotel Image: GET] Could not find the hotel");
    }
  } catch (error) {
    console.error(error);
  }
};

const hotel_new_image_post = async (req, res) => {
  let preventDuplicateError = 0;
  const hotel_id = req.body.hotel_id;
  const hotelImageFiles = req.files;
  const user = req.session.user;
  console.log(hotel_id);
  console.log(user);
  // reform image name
  let reformImageName = [];
  for (let i = 0; i < hotelImageFiles.length; i++) {
    let eachImageFile = hotelImageFiles[i];
    // this will have [filename, .extension]
    console.log(eachImageFile.originalname);
    let splitImageByTitleAndExtend = eachImageFile.originalname.split(".");
    let hotelImageName =
      preventDuplicateError++ +
      "_" +
      hotel_id +
      "_" +
      splitImageByTitleAndExtend[0] +
      "." +
      splitImageByTitleAndExtend[1];
    reformImageName.push(hotelImageName);
    let params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${hotelImageName}`,
      Body: eachImageFile.buffer,
    };
    await s3.s3.upload(params).promise();
    console.log("[Post Image upload] added on S3");
    // , (error, data) => {
    //   if (error) {
    //     console.error("[Post Image upload] S3 Bucket Error" + error);
    //   }
    //   console.log("[Post Image upload] added on S3");
    // });
    console.log("Loop");
  }
  console.log(reformImageName);
  try {
    await Hotel.findByIdAndUpdate(hotel_id, { imageUrls: reformImageName });
    res.status(200).redirect("/");
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  hotel_search_index,
  hotel_new_get,
  hotel_new_post,
  hotel_new_image_get,
  hotel_new_image_post,
};
