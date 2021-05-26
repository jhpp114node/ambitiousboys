const trimCity = require("./modules/trim_city_name");
const express = require("express");
const mongoose = require("./utils/db");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
var passport = require("passport");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(
  session({
    secret: "this will be in env file later",
    saveUninitialized: false,
    resave: true,
    cookie: { maxAge: 6000000 },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  res.locals.user = req.session.user;
  next();
});

// ROUTER =====================
const HOTEL_SEARCH_ROUTE = require("./routes/Hotel.js");
const HOTEL_POSTER_ROUTE = require("./routes/BecomePoster.js");
const AUTH_ROUTE = require("./routes/Auth.js");
const ACCOUNT_ROUTE = require("./routes/Account.js");
app.use("/hotel", HOTEL_SEARCH_ROUTE);
app.use("/post", HOTEL_POSTER_ROUTE);
app.use("/auth", AUTH_ROUTE);
app.use("/user", ACCOUNT_ROUTE);
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
