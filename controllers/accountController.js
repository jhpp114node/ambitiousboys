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

module.exports = {
  account_get,
};
