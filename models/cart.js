const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    menuItems: [
        {
            menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem"},
            quantity: { type: Number, required: true, min: 1 },
            amount: { type: Number, required: true},
        },
    ],
}); 

module.exports = mongoose.model("Cart", cartSchema);