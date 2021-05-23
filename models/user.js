const mongoose = require("../utils/db");

const userSchema = mongoose.mongoose.Schema(
  {
    _id: mongoose.mongoose.Types.ObjectId,
    email: String,
    username: String,
    password: String,
    isAdmin: Boolean,
    image: String,
  },
  { timestamps: true }
);

module.exports = mongoose.mongoose.model("User", userSchema);
