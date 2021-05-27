const s3 = require("../utils/s3");
const session = require("express-session");
const User = require("../models/user");
const Hotel = require("../models/hotel");
require("dotenv").config();
// get route
const account_get = async (req, res) => {
  const user = req.session.user;
  try {
    const usersPostHotel = await Hotel.find({ user: user.user_id });
    const imageData = [];
    for (let i = 0; i < usersPostHotel.length; i++) {
      let param = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${usersPostHotel[i].imageUrls[0]}`,
      };
      let hotelImageDataS3 = await s3.s3.getObject(param).promise();
      let hotel_image = hotelImageDataS3.Body;
      let buffer = Buffer.from(hotel_image);
      let base64data = buffer.toString("base64");
      let imageDOM = "data:image/jpeg;base64," + base64data;
      imageData.push(imageDOM);
    }
    // console.log(imageData);

    const userObject = {
      user: user,
      postedHotel: usersPostHotel,
      imageDOM: imageData,
    };
    // console.log(userObject);
    return res.status(200).render("account/user", { userObject: userObject });
  } catch (error) {
    console.error(error);
  }
};

// user delete account
const account_delete = async (req, res) => {
  console.log("Reached account delete request");
  const deleteTargetUserId = req.session.user.user_id;
  try {
    // find all hotels that the user posted
    const deleteTargetHotelsImgObject = await Hotel.find({
      user: deleteTargetUserId,
    }).select("imageUrls");
    // console.log(deleteTargetHotelsImgObject);
    const deleteS3Image = [];
    for (let i = 0; i < deleteTargetHotelsImgObject.length; i++) {
      // deleteS3Image.push(deleteTargetHotelsImgObject[i].imageUrls);
      let deleteObj = deleteTargetHotelsImgObject[i].imageUrls;
      for (let j = 0; j < deleteObj.length; j++) {
        deleteS3Image.push(deleteObj[j]);
      }
    }
    console.log(deleteS3Image);
    // grab all images and set it into object for S3 operation
    let s3DeleteKey = [];
    for (let i = 0; i < deleteS3Image.length; i++) {
      let eachImageToDelete = deleteS3Image[i];
      s3DeleteKey.push({ Key: `${eachImageToDelete}` });
    }
    let params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: s3DeleteKey,
      },
    };
    try {
      // delete images in S3 and delete hotel from database
      await s3.s3.deleteObjects(params).promise();
      await Hotel.remove({ user: deleteTargetUserId });
      // finally delete user
      await User.findByIdAndRemove(deleteTargetUserId);
      req.session.destroy((err) => {
        res.status(301).redirect("/");
      });
    } catch (s3Error) {
      throw Error("[Delete]: User account delete" + s3Error);
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  account_get,
  account_delete,
};
