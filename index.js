const trimCity = require("./modules/trim_city_name");
const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTER =====================
const HOTEL_SEARCH_ROUTE = require("./routes/Hotel.js");
const HOTEL_POSTER_ROUTE = require("./routes/BecomePoster.js");
app.use("/hotel", HOTEL_SEARCH_ROUTE);
app.use("/post", HOTEL_POSTER_ROUTE);
// ROOT ROUTES ================

app.get("/", (req, res) => {
  res.status(200).render("root/index");
});

app.post("/", (req, res) => {
  console.log(req.body);
  const { location, checkin_date, checkout_date } = req.body;
  const trimLocation = trimCity(location);
  const hotelSearchKeyword = {
    trimLocation: trimLocation,
    checkin_date: checkin_date,
    checkout_date: checkout_date,
  };
  res.cookie("hotelSearchKeyword", hotelSearchKeyword);
  res.redirect(`/hotel/search/${trimLocation}`);
});

app.listen(PORT, () => {
  console.log(`The ambitious boys app is listening to ${PORT}`);
});
