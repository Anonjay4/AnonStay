import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./config/connectDB.js"
import userRouter from "./routes/user.routes.js"
import hotelRouter from "./routes/hotel.routes.js"
import roomRouter from "./routes/room.routes.js"
import bookingRouter from "./routes/booking.routes.js"
import { startBookingScheduler } from './services/bookingScheduler.js'
dotenv.config()

const app = express()

// Database Connection
connectDB()
// Middlewares
app.use(express.json())
app.use(cors({ origin: ["http://localhost:5173","https://your-frontend.up.railway.app"], credentials: true }))
app.use(cookieParser())

// API ENDPOINTS
app.get("/", (req, res) => {
    res.send("Hello world from server")
})

app.use("/images", express.static("uploads"))
app.use("/api/user", userRouter)
app.use("/api/hotel", hotelRouter)
app.use("/api/room", roomRouter)
app.use("/api/bookings", bookingRouter)
startBookingScheduler()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})
