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

module.exports = {
  hotel_search_index,
};
