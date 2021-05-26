const multer = require("multer");

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});
// mulitple
const upload_multiple = multer({ storage: storage }).array("hotelImages");

module.exports = { upload_multiple };
