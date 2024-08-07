const mongoose = require("mongoose")

const MenuItemSchema = new mongoose.Schema({
    category: {type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true},
    name: {type: String, required: true},
    img: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema)