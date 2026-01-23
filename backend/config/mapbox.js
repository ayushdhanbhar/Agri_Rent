const axios = require("axios");
const express = require('express');
require('dotenv').config();

const mapboxClient = axios.create({
  baseURL: "https://api.mapbox.com/geocoding/v5/mapbox.places",
  params: {
    access_token: process.env.MAPBOX_ACCESS_TOKEN
  }
});
exports = module.exports = mapboxClient;