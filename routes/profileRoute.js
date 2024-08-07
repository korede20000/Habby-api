const express = require('express');
const router = express.Router();
const multer = require('multer');
const {auth} = require("../middleware/auth")
const authController = require("../controllers/authController")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage });

router.put('/profile/image', auth, upload.single('image'), authController.updateProfileImage)

module.exports = router;
