const express = require("express")
const {auth} = require("../middleware/auth")
const paymentController = require("../controllers/paymentController")

const router = express.Router();

router.post("/api/payment/initiate", auth, paymentController.initiatePayment)
router.post("/api/payment/verify", auth, paymentController.verifyPayment)
router.get("/api/orders", auth, paymentController.getOrderHistory)
module.exports = router