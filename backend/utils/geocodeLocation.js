const mapboxClient  = require("../config/mapbox.js");

const geocodeLocation = async(locationString) => {
  const response = await mapboxClient.get(
    `/${encodeURIComponent(locationString)}.json`,
    {
      params: {
        country: "in",
        limit: 1,
        country: "in"
      }
    }
  );

  if (!response.data.features.length) {
    throw new Error("Location not found");
  }

  const feature = response.data.features[0];

  return {
    lat: feature.center[1],
    lng: feature.center[0],
    placeName: feature.place_name
  };
};

exports = module.exports = geocodeLocation;