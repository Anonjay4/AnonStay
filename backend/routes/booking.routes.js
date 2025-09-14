import express from "express"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import { isOwner } from "../middlewares/isOwner.js"
import { 
    bookRoom, 
    checkRoomAvailability, 
    getHotelBookings, 
    getUserBookings, 
    mockPayment, 
    verifyMockPayment, 
    updateBookingStatus, 
    searchHotelBookings, 
    cancelUserBooking, 
    confirmCheckIn 
} from "../controllers/booking.controller.js"

const bookingRouter = express.Router()

bookingRouter.post("/check-availability", checkRoomAvailability)
bookingRouter.post("/book", isAuthenticated, bookRoom)
bookingRouter.get("/user", isAuthenticated, getUserBookings)
bookingRouter.get("/hotel", isAuthenticated, isOwner, getHotelBookings)
bookingRouter.post("/mock-payment", isAuthenticated, mockPayment)
bookingRouter.post("/verify-payment", isAuthenticated, verifyMockPayment)
bookingRouter.put("/update-status/:bookingId", isAuthenticated, isOwner, updateBookingStatus)
bookingRouter.get("/hotel/search", isAuthenticated, isOwner, searchHotelBookings)
bookingRouter.put('/cancel/:bookingId', isAuthenticated, cancelUserBooking)
bookingRouter.put('/check-in/:bookingId', isAuthenticated, isOwner, confirmCheckIn);

export default bookingRouter