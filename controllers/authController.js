const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // For sending emails

// Password Validation Function
const validatePassword = (password) => {
    const pass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return pass.test(password);
};


// Register with Email Verification
exports.register = async (req, res) => {
    const { firstName, lastName, email, phone, password, confirmPassword, addresses, role } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.json("Passwords do not match");
    }

    // Validate Password
    if (!validatePassword(password)) {
        return res.json("Password must be at least 8 characters long and contain one number and one alphabet");
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.json("User already exists");
        }

        // Create verification token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            addresses,
            role,
            verificationToken,
            isVerified: false
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await newUser.save();
        console.log("New user registered:", newUser.email);

        // Send verification email
        const transporter = nodemailer.createTransport({
            service: "outlook",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify transporter configuration
        await transporter.verify();
        console.log("Email transporter verified successfully.");

        const mailOptions = {
            from: `"Habby" <${process.env.EMAIL_USER}>`,
            to: newUser.email,
            subject: 'Verify your email address',
            html: `
                <h1>Email Verification</h1>
                <p>Please verify your email by clicking the link below:</p>
                <a href="http://habby-api.onrender.com/verify-email?token=${verificationToken}">Verify Email</a>
                <p>If you did not request this, please ignore this email.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.json({ message: "Error sending verification email" });
            }
            res.json({ message: "Registration successful, please check your email for verification link" });
        });
    } catch (error) {
        res.json({ message: error.message });
    }
};

// Email Verification
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    // Handle missing token
    if (!token) {
        return res.status(400).json("Token is required");
    }

    try {
        const user = await User.findOne({ verificationToken: token });

        // Handle invalid or expired token
        if (!user) {
            return res.status(400).json("Invalid or expired token");
        }

        // Verify the user
        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Send success response
        res.status(200).json("Email verified successfully");
    } catch (error) {
        // Log the error and send a response
        console.error("Error during email verification:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// Login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json("Invalid Email/Password");
        }

        if (!user.isVerified) {
            return res.json("Please verify your email before logging in.");
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json("Invalid Email/Password");
        }

        const token = user.generateAuthToken();
        res.json({ token });
    } catch (error) {
        res.json({ message: error.message });
    }
};


exports.getUser = async(req, res) =>{
    try {
        const user = await User.findById(req.user.id)
        res.json(user)
    } catch (error) {
        res.json({message: error.message});
    }
}

exports.updateUserProfile = async (req, res) => {
    const { firstName, lastName, phone, addresses } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.addresses = addresses || user.addresses;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.img = req.file.path; 
        await user.save();

        res.json({ msg: 'Profile image updated successfully', img: user.img });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};
