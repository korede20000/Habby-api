const mongoose = require("mongoose")

const menuSchema = new mongoose.Schema({
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    name:{type:String, required: true},
    img: {type: String, required: true},
    price: {type: Number, required: true},
    africanDelight: {type: Boolean, default: false},
    westernCuisine: {type: Boolean, default: false}
    
}, {timestamps: true})

module.exports = mongoose.model("Menu", menuSchema)     