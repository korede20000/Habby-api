const mongoose = require("mongoose")

const menuSchema = new mongoose.Schema({
    name:{type:String, required: true},
    img: {type: String, required: true},
    africanDelight: {type: Boolean, default: false},
    westernCuisine: {type: Boolean, default: false}
    
}, {timestamps: true})

module.exports = mongoose.model("Menu", menuSchema)     