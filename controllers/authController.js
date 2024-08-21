const User = require("../models/user")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto");
const nodemailer = require("nodemailer");


exports.register = async (req, res) => {
    const { firstName, lastName, email, phone, password, confirmPassword, addresses, role } = req.body;

    if (password !== confirmPassword) {
        return res.json("Passwords do not match");
    }

    if (!validatePassword(password)) {
        return res.json("Password must contain at least 8 characters, including one number and one letter");
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.json("User already exists");
        }

        user = new User({ firstName, lastName, email, phone, password, addresses, role });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        
        const verificationToken = user.generateVerificationToken();
        await user.save();

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/verify-email/${verificationToken}`;

        // Setup email data
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_FROM,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Email Verification",
            html: `<p>Please verify your email by clicking the link below:</p><a href="${verificationUrl}">Verify Email</a>`
        };

        await transporter.sendMail(mailOptions);

        res.json("Registration successful. Please check your email to verify your account.");
    } catch (error) {
        res.json({ message: error.message });
    }
};


exports.verifyEmail = async (req, res) => {
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    try {
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json("Invalid or expired token");
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json("Email verified successfully");
    } catch (error) {
        res.json({ message: error.message });
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
