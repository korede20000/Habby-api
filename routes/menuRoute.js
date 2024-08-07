const express = require("express")
const menuController = require("../controllers/menuController") 
const multer = require("multer")
const {auth, admin } = require("../middleware/auth")
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

router.post("/", auth, admin, upload.single("img"), menuController.createMenu)
router.get("/", menuController.getAllMenu)
router.get("/africanDelight", menuController.getAfricanDelightMenu)
router.get("/westernCuisine", menuController.getWesternCuisineMenu) 

module.exports = router