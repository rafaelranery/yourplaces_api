const axios = require('axios')

const HttpError = require('../models/http-error')

const API_KEY = 'AIzaSyA4o6CvI11gjDl1RBvIOIlscQqQ6rn-6ms'

const getCoordsForAdress = async (adress) => {
  const res = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(adress)}&key=${API_KEY}`)

  const data = res.data;

  if (!data || data.status === "ZERO_RESULTS") {
    throw new HttpError('Could not find location for the specified adress.', 422);
  }

  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAdress;