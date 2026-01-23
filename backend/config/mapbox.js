const axios = require("axios");

const mapboxClient = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  params: {
    access_token: process.env.MAPBOX_ACCESS_TOKEN
  }
});
exports = module.exports = mapboxClient;