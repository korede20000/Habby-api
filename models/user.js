const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String},
    email: {type: String, required: true, unique: true},
    phone: {type: String},
    img: {type: String, default: "uploads/avatar.png"},
    password: {type: String, required: true},
    addresses: [{
        street: String, 
        city: String,
    }],
    role: {type: String, enum: ["admin", "client"], default: "client"},
    isVerified: { type: Boolean, default: false }, // New field
    verificationToken: { type: String }, // New field

})

userSchema.methods.generateAuthToken = function(){
    const token = jwt.sign(
        { id: this._id, role: this.role},
        process.env.JWT_SECRET_KEY
    );

    return token
};

module.exports = mongoose.model("User", userSchema)