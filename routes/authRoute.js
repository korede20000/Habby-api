const express = require("express")
const authController = require("../controllers/authController")
const {auth} = require("../middleware/auth")

const router = express.Router()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.get("/user", auth, authController.getUser)
router.put("/profile", auth, authController.updateUserProfile)
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router