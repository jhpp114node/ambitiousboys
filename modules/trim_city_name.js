module.exports = trimCity = (str) => {
  // example Seattle, WA, USA
  // [Seattle, WA, USA]
  const cityWithState = str.split(",");
  const cityName = cityWithState[0].toLowerCase();
  return cityName;
};
