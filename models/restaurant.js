
const mongoose = require("mongoose")

const RestaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    img: { type: String, required: true },
    rating: { type: Number, required: true },
    operatingHours: [{
        day: { type: String, required: true },
        hours: { type: String, required: true }
    }],
    location: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }
});
  
module.exports = mongoose.model('Restaurant', RestaurantSchema)