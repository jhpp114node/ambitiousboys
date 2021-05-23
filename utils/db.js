const mongoose = require("mongoose");
require("dotenv").config();
mongoose
  .connect(process.env.MONGODB_CONNECTION_URL, { useMongoClient: true })
  .then(() => {
    console.log("DB is connected successfully");
  })
  .catch((error) => {
    console.error(error);
  });

module.exports = { mongoose };
