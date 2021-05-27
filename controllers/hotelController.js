const s3 = require("../utils/s3");
const Hotel = require("../models/hotel");
const trimCity = require("../modules/trim_city_name");
const addSemiToEachImageData = require("../modules/imageFilter");
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

    // fetch data from database that the city is seattle and image is not null
    const hotelDataFromDB = await Hotel.find({ city: cityname })
      .where("imageUrls")
      .ne(null)
      .sort({ updatedAt: -1 });
    // console.log(hotelDataFromDB);
    // create a map key: hotel id and value is image buffer
    const imageHashMap = new Map();
    for (let i = 0; i < hotelDataFromDB.length; i++) {
      // console.log(`${hotelDataFromDB[i].imageUrls[0]}`);
      let param = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${hotelDataFromDB[i].imageUrls[0]}`,
      };
      let hotelImageS3Obj = await s3.s3.getObject(param).promise();
      let hotelImageS3Body = hotelImageS3Obj.Body;
      let buffer = Buffer.from(hotelImageS3Body);
      let base64Data = buffer.toString("base64");
      let imageDomFromS3 = "data:image/jpeg;base64," + base64Data;
      imageHashMap.set(hotelDataFromDB[i]._id, imageDomFromS3);
    }
    const renderDataObj = {
      searchedCity: cityname,
      apiGoogleMapGeoLocation: hotelData.results.locations[0],
      filteredData: filteredData,
      hotelDataFromDB: hotelDataFromDB,
      imageHashMap: imageHashMap,
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
      full_city_name: hotelCity,
      is_hotel_api: false,
      api_hotel_id: null,
      imageUrls: null,
      user: postUserID,
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
    // console.log(eachImageFile.originalname);
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
  }
  console.log(reformImageName);
  try {
    await Hotel.findByIdAndUpdate(hotel_id, { imageUrls: reformImageName });
    res.status(200).redirect("/");
  } catch (error) {
    console.error(error);
  }
};

const hotel_detail_get = async (req, res) => {
  const hotelIDForDetail = req.params.id;
  try {
    const hotelDataDetail = await Hotel.findById(hotelIDForDetail);
    const imageData = hotelDataDetail.imageUrls;
    // retrieve all images from S3 bucket
    const imageFromS3 = [];
    for (let i = 0; i < imageData.length; i++) {
      let param = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${imageData[i]}`,
      };
      let hotelImageDataS3 = await s3.s3.getObject(param).promise();
      let hotel_image = hotelImageDataS3.Body;
      let buffer = Buffer.from(hotel_image);
      let base64data = buffer.toString("base64");
      let imageDOM = "data:image/jpeg;base64," + base64data;
      imageFromS3.push(imageDOM);
    }
    const hotelObjectForDetail = {
      hotelDataDetail: hotelDataDetail,
      imageFromS3: imageFromS3,
    };
    return res.status(200).render("hotel/hotelDetail", {
      hotelObjectForDetail: hotelObjectForDetail,
    });
  } catch (error) {
    console.error(error);
  }
};

const hotel_edit_get = async (req, res) => {
  const hotelEditId = req.params.id;
  // retrieve target hotel data from db
  try {
    const hotelEditTarget = await Hotel.findById(hotelEditId);
    const hotelEditImageUrls = hotelEditTarget.imageUrls;
    const hotelEditImagesFromS3 = new Map();
    for (let i = 0; i < hotelEditImageUrls.length; i++) {
      let param = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${hotelEditImageUrls[i]}`,
      };
      let hotelImageDataS3 = await s3.s3.getObject(param).promise();
      let hotel_image = hotelImageDataS3.Body;
      let buffer = Buffer.from(hotel_image);
      let base64data = buffer.toString("base64");
      let imageDOM = "data:image/jpeg;base64," + base64data;
      hotelEditImagesFromS3.set(hotelEditImageUrls[i], imageDOM);
    }
    const hotelObjectForEdit = {
      hotelEditTarget: hotelEditTarget,
      hotelEditImagesFromS3: hotelEditImagesFromS3,
    };
    return res.status(200).render("hotel/hotelEdit", {
      hotelObjectForEdit: hotelObjectForEdit,
    });
  } catch (error) {
    console.error(error);
  }
};

const hotel_edit_put = async (req, res) => {
  console.log("in put request");
  let preventEditDuplicateImage = 0;
  const hotelEditTargetId = req.params.id;
  const { hotelLabel, hotelCity, hotel_location_street } = req.body;
  const hotelEditImage = req.files;
  const preExistImageId = req.body.imageId;

  // =========================================
  // Image ID Check
  const myImageGotDeleteArray = [];
  const myImageRemainArray = [];
  if (typeof preExistImageId !== "undefined") {
    console.log("prev function");
    let parsedImageData = addSemiToEachImageData(preExistImageId);
    const imageObjInDatabase = await Hotel.findById(hotelEditTargetId).select(
      "imageUrls"
    );
    // previousImages contains Array of image urls (S3 keys)
    const imageInDatabase = imageObjInDatabase.imageUrls;
    for (let i = 0; i < imageInDatabase.length; i++) {
      if (!parsedImageData.includes(imageInDatabase[i])) {
        // push the image that user erased from existing image
        myImageGotDeleteArray.push(imageInDatabase[i]);
      } else {
        // push the image that user did not erased from existing image
        myImageRemainArray.push(imageInDatabase[i]);
      }
    }
  }
  // End of Image ID Check

  // need to trim the cityname
  let trimCityForDatabase = trimCity(hotelCity);
  let fullnameForDatabase = hotelLabel + " " + hotelCity;
  try {
    // update database based on all data that passed from the user
    const hotelEditObject = {
      fullname: fullnameForDatabase,
      city: trimCityForDatabase,
      _score: 0,
      label: hotelLabel,
      address: hotel_location_street,
      full_city_name: hotelCity,
      api_hotel_id: null,
    };
    await Hotel.findByIdAndUpdate(hotelEditTargetId, hotelEditObject);
  } catch (error) {
    console.error(error);
  }
  // Delete all S3 images related to the target hotel
  for (let i = 0; i < myImageGotDeleteArray.length; i++) {
    // delete all keys from S3
    let params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${myImageGotDeleteArray[i]}`,
    };
    await s3.s3.deleteObject(params).promise();
  }
  // after delete all images from S3
  // add new edit image into S3
  let editReformImageName = [];
  for (let i = 0; i < hotelEditImage.length; i++) {
    let eachREformImageFile = hotelEditImage[i];
    let splitImageByTitleAndExtension =
      eachREformImageFile.originalname.split(".");
    let hotelImageName =
      preventEditDuplicateImage++ +
      "_" +
      hotelEditTargetId +
      splitImageByTitleAndExtension[0] +
      "." +
      splitImageByTitleAndExtension[1];
    editReformImageName.push(hotelImageName);
    let params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${hotelImageName}`,
      Body: eachREformImageFile.buffer,
    };
    await s3.s3.upload(params).promise();
  }
  // store remained image from edit into new reform array
  for (let i = 0; i < myImageRemainArray.length; i++) {
    editReformImageName.push(myImageRemainArray[i]);
  }
  // add updated image into database
  try {
    await Hotel.findByIdAndUpdate(hotelEditTargetId, {
      imageUrls: editReformImageName,
    });
    res.status(301).redirect(`/hotel/${hotelEditTargetId}`);
  } catch (error) {
    console.error(error);
  }
};

const hotel_delete = async (req, res) => {
  const deleteTargetHotelId = req.params.id;
  // find the hotel from database
  const deleteTargetHotel = await Hotel.findById(deleteTargetHotelId).select(
    "imageUrls"
  );
  // get images
  const deleteTargetImages = deleteTargetHotel.imageUrls;
  const deleteS3Objects = [];
  for (let i = 0; i < deleteTargetImages.length; i++) {
    let eachDeletImg = deleteTargetImages[i];
    deleteS3Objects.push({ Key: `${eachDeletImg}` });
  }
  let params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Delete: {
      Objects: deleteS3Objects,
    },
  };
  // delete the hotel obj from database
  try {
    // delete images from bucket
    await s3.s3.deleteObjects(params).promise();
    await Hotel.findByIdAndRemove(deleteTargetHotelId);
    res.status(301).redirect("/user/account");
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
  hotel_detail_get,
  hotel_edit_get,
  hotel_edit_put,
  hotel_delete,
};
