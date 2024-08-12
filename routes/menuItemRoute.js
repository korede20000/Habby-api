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

router.post("/", auth, admin, upload.single("img"), menuItemController.CreateMenuItem);
router.get("/restaurant/:restaurantId", menuItemController.getMenuItemByRestaurant); // More specific route first
router.get("/:id", menuItemController.getSingleMenuItem); // More general route second
router.get("/", menuItemController.getAllMenuItem);
router.delete("/:id", menuItemController.removeMenuItem);



module.exports = router