const mongoose = require('mongoose')

const Schema = mongoose.Schema;

/* creating schema for model */
const placeSchema = new Schema({
  title: {
    type: String, required: true
  },
  description: {
    type: String, required: true
  },
  image: {
    type: String, required: true
  },
  adress: {
    type: String, required: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },

});

/* exporting model, which carries a constructor function for the schema */
module.exports = mongoose.model('Place', placeSchema)