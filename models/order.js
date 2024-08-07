const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    orderId: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    phone: {type: String, required: true},
    address: {type: String, required: true},
    menuItems: [{
        menuItem: {type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true},
        quantity: {type: Number, required: true}
    }],
    amount: {type: Number, required: true},
    status: {type: String, default: "Pending"},
    transactionId: {type: String, required: true},
    address: String,
    date: {type: Date, default: Date.now}
})  

module.exports = mongoose.model("Order", OrderSchema)