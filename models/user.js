const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    img: { type: String, default: "uploads/avatar.png" },
    password: { type: String, required: true },
    addresses: [{
        street: String, 
        city: String,
    }],
    role: { type: String, enum: ["admin", "client"], default: "client" },
    isVerified: { type: Boolean, default: false }, // Email verification status
    verificationToken: { type: String }, // Verification token
    verificationTokenExpires: { type: Date }, // Token expiration time
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET_KEY
    );
    return token;
};

userSchema.methods.generateVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    this.verificationToken = hashedToken;
    this.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // Token expires in 24 hours

    return verificationToken;
};
module.exports = mongoose.model("User", userSchema)