import { geocodeLocation } from "../utils/geocodeLocation.js";

export const saveFarmerLocation = async (req, res) => {
  const { location } = req.body;

  const geo = await geocodeLocation(location);

  const farmer = {
    name: "Ganpat",
    locationText: location,
    lat: geo.lat,
    lng: geo.lng
  };

  // save farmer to DB here
  res.json(farmer);
};
