const express = require("express")
const cartController = require("../controllers/cartController")
const {auth} = require("../middleware/auth")

const router = express.Router()



router.post("/addToCart", auth, cartController.addToCart)
router.get("/cart", auth, cartController.getCart)
router.post("/update-quantity", auth, cartController.updateQuantity)
router.post("/delete-item", auth, cartController.removeItem)

module.exports = router