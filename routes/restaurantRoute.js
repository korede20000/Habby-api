const express = require("express")
const router = express.Router()
const restaurantController = require('../controllers/restaurantController')
const multer = require("multer")
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
})
const upload = multer({storage: storage})

router.post("/", upload.single("img"), restaurantController.CreateRestaurant)
router.get("/", restaurantController.getRestaurant)

module.exports = router