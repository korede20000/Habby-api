const express = require("express")
const connectDB = require("./config/db")
const categoryRoute = require("./routes/categoryRoute")
const menuRoute =  require("./routes/menuRoute")
const restaurantRoute = require('./routes/restaurantRoute')
const menuItemRoute = require('./routes/menuItemRoute')
const authRoute = require('./routes/authRoute')
const cartRoute = require("./routes/cartRoute")
const paymentRoute = require("./routes/paymentRoute")
const profileRoute = require("./routes/profileRoute")
const cookieParser = require("cookie-parser")
const cors = require("cors")

connectDB()
const app = express()

    
app.use(cors({
    origin: "https://habby-frontend.vercel.app",
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}))


app.use(express.json())
app.use(cookieParser())
app.use("/uploads", express.static('uploads'))
app.use("/api/category", categoryRoute)
app.use("/api/menu", menuRoute)
app.use("/api/restaurant", restaurantRoute)
app.use("/api/menuItem", menuItemRoute)
app.use("/", authRoute)
app.use("/", cartRoute)
app.use("/", paymentRoute)
app.use("/", profileRoute)


const port = process.env.PORT || 3000
app.listen(port, ()=> console.log(`You are listening on port ${port}`)) 