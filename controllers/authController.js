const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // For sending emails

// Password Validation Function
function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}


const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;
    return re.test(String(email).toLowerCase());
};


exports.register = async (req, res) => {
    const {
        firstName,
        lastName = "",  // Default value if not provided
        email,
        phone = "",  // Default value if not provided
        addresses = [],  // Default value if not provided
        password,
        confirmPassword
    } = req.body;

    // Input Validation
    if (!firstName || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: "Fill in all required fields: First Name, Email, Password, Confirm Password." });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long and contain at least one letter, one number, and one special character."
        });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            phone,
            addresses,
            password: hashedPassword,
            verificationToken,
            isVerified: false
        });

        await newUser.save();
        console.log("New user registered:", newUser.email);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

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

        await transporter.sendMail(mailOptions);
        console.log("Verification email sent to:", newUser.email);

        return res.status(201).json({
            message: "Registration successful. Please check your email to verify your account."
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({
            message: "An error occurred during registration. Please try again later."
        });
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
            return res.status(400).json({ message: "Invalid Email/Password" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: "Please verify your email before logging in." });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid Email/Password" });
        }

        const token = user.generateAuthToken();
        return res.status(200).json({ token });
    } catch (error) {
        return res.status(500).json({ message: error.message });
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
