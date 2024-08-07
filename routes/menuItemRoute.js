const express = require("express")
const menuItemController = require('../controllers/menuItemController')
const {auth, admin } = require("../middleware/auth")

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

const router = express.Router()

router.post("/", auth, admin, upload.single("img"), menuItemController.CreateMenuItem)
router.get("/", menuItemController.getMenuItem)
router.get('/:restaurantId', menuItemController.getMenuItem)
router.get("/", menuItemController.getAllMenuItem)
router.get('/:restaurantId', menuItemController.getMenuItemByRestaurant)


module.exports = router