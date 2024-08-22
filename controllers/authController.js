const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

//Password Validation Function
const validatePassword = (password) => {
    const pass = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return pass.test(password);
};

// Setup Nodemailer transporter (Gmail example, adjust accordingly)
const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});

exports.register = async (req, res) => {
    const { firstName, lastName, email, phone, password, confirmPassword, addresses, role } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
        return res.json("Passwords do not match");
    }

    // Validate Password
    if (!validatePassword(password)) {
        return res.json("Password must be at least 8 characters long and contain at least one number and one alphabet");
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.json("User already exists");
        }

        // Create a new user with "pending" status
        user = new User({
            firstName,
            lastName,
            email,
            phone,
            password,
            addresses,
            role,
            status: "pending"
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        // Generate verification token
        const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send verification email
        const verificationLink = `http://habby-api.onrender.com/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Email Verification',
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email and activate your account.</p>`
        };

        await transporter.sendMail(mailOptions);

        await user.save();

        res.json("A verification email has been sent to your email address. Please verify your email to activate your account.");
    } catch (error) {
        res.json({ message: error.message });
    }
};


exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find user by ID and activate the account
        let user = await User.findById(userId);
        if (!user || user.status !== "pending") {
            return res.json("Invalid or expired token");
        }

        user.status = "active";
        await user.save();

        res.json("Your email has been verified. Your account is now active.");
    } catch (error) {
        res.json({ message: "Invalid or expired token" });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.json("Invalid Email/Password");
        }

        if (!user.isVerified) {
            return res.json("Email Not Verified");
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
