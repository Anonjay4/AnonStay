import transporter from '../config/nodemailer.js';
import Booking from '../models/booking.model.js';
import Hotel from '../models/hotel.model.js';
import Room from '../models/room.model.js';
import User from '../models/user.model.js';
import axios from 'axios';

const awardLoyaltyPoint = async (bookingId) => {
    try {
        console.log(`🎯 Attempting to award loyalty point for booking: ${bookingId}`);
        
        const booking = await Booking.findById(bookingId).populate('user');
        
        if (!booking) {
            console.log(`❌ Booking not found: ${bookingId}`);
            return false;
        }
        
        // Check if loyalty point already awarded (prevent duplicates)
        if (booking.loyaltyPointAwarded === true) {
            console.log(`⚠️ Loyalty point already awarded for booking: ${bookingId}`);
            return false;
        }
        
        console.log(`👤 User: ${booking.user.name} (${booking.user.email})`);
        console.log(`📊 Current loyalty points: ${booking.user.loyaltyPoints}`);
        
        // Award the point
        const userUpdateResult = await User.findByIdAndUpdate(booking.user._id, {
            $inc: { loyaltyPoints: 1 }
        }, { new: true });
        
        // Mark booking as awarded to prevent duplicates
        await Booking.findByIdAndUpdate(bookingId, {
            loyaltyPointAwarded: true
        });
        
        console.log(`✅ Loyalty point awarded successfully!`);
        console.log(`📈 New loyalty points balance: ${userUpdateResult.loyaltyPoints}`);
        return true;
    } catch (error) {
        console.error(`❌ Error awarding loyalty point for booking ${bookingId}:`, error);
        return false;
    }
};

const isRoomDiscountActive = (room) => {
    if (!room?.hasDiscount) return false;
    
    const now = new Date();
    const startDate = room.discountStartDate ? new Date(room.discountStartDate) : null;
    const endDate = room.discountEndDate ? new Date(room.discountEndDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
};

const getCurrentRoomPrice = (room) => {
    return isRoomDiscountActive(room) ? room.discountedPrice : room.pricePerNight;
};

// Function to check room availability
export const checkAvailability = async ({ room, checkInDate, checkOutDate }) => {
    try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);

        // Find overlapping bookings that are NOT cancelled
        const bookings = await Booking.find({
            room: room,
            status: { $ne: "cancelled" }, // Exclude cancelled bookings
            $or: [
                { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
            ]
        });

        // Room is available if there are no overlapping active bookings
        return bookings.length === 0;
    } catch (error) {
        console.error("Error checking availability:", error);
        return false;
    }
};

// Api to check room availability
// POST /api/bookings/check-availability
export const checkRoomAvailability = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body
        const isAvailable = await checkAvailability({ room, checkInDate, checkOutDate })
        res.status(200).json({ success: true, isAvailable })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Api to book a room
// POST /api/bookings/book
export const bookRoom = async (req, res) => {
    try {
        const { id } = req.user
        const user = await User.findById(id)
        const { 
            room, 
            checkInDate, 
            checkOutDate, 
            persons, 
            paymentMethod, 
            useLoyaltyDiscount = false,
            loyaltyPointsUsed = 0,
            discountPercentage = 0
        } = req.body

        const isAvailable = await checkAvailability({
            room,
            checkInDate,
            checkOutDate,
        })
        if (!isAvailable) {
            return res.status(400).json({ message: "Room is not available", success: false })
        }

        // Validate loyalty points usage
        if (useLoyaltyDiscount) {
            if (loyaltyPointsUsed < 5) {
                return res.status(400).json({ 
                    message: "Minimum 5 loyalty points required for discount", 
                    success: false 
                })
            }
            
            if (user.loyaltyPoints < loyaltyPointsUsed) {
                return res.status(400).json({ 
                    message: "Insufficient loyalty points", 
                    success: false 
                })
            }
            
            // Validate discount percentage (1% per point, max 50%)
            const expectedDiscount = Math.min(loyaltyPointsUsed * 1, 50)
            if (Math.abs(discountPercentage - expectedDiscount) > 0.01) {
                return res.status(400).json({ 
                    message: "Invalid discount calculation", 
                    success: false 
                })
            }
        }

        const roomData = await Room.findById(room).populate("hotel")
        
        // Use the current effective price (includes room discount if active)
        const currentRoomPrice = getCurrentRoomPrice(roomData);
        let totalPrice = currentRoomPrice;

        const checkIn = new Date(checkInDate)
        const checkOut = new Date(checkOutDate)
        const timeDiff = checkOut.getTime() - checkIn.getTime()
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24))
        
        // Calculate base price using current room price (already includes room discount)
        const originalPrice = totalPrice * nights * persons
        
        // Apply additional loyalty discount if applicable (on top of room discount)
        if (useLoyaltyDiscount && discountPercentage > 0) {
            totalPrice = originalPrice * (1 - discountPercentage / 100)
        } else {
            totalPrice = originalPrice
        }

        const booking = await Booking.create({
            user: id,
            room,
            hotel: roomData.hotel._id,
            checkIn,
            checkOut,
            persons,
            totalPrice,
            originalPrice,
            paymentMethod: paymentMethod === "Pay Online" ? "Paystack" : paymentMethod,
            loyaltyPointsUsed: useLoyaltyDiscount ? loyaltyPointsUsed : 0,
            discountApplied: useLoyaltyDiscount ? discountPercentage : 0
        })

        // Deduct loyalty points if used
        if (useLoyaltyDiscount && loyaltyPointsUsed > 0) {
            await User.findByIdAndUpdate(id, {
                $inc: { loyaltyPoints: -loyaltyPointsUsed }
            })
        }

        // Enhanced email with room discount information
        const roomDiscountActive = isRoomDiscountActive(roomData);
        const roomDiscountAmount = roomDiscountActive ? 
            (roomData.pricePerNight - roomData.discountedPrice) * nights * persons : 0;
        
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Room Booked Successfully",
            html: `
                    <h1>Room Booking Confirmation</h1>
                    <p>Hello ${user.name},</p>
                    <p>Thank you for booking with AnonStay. Your booking details are as follows:</p>
                    <ul>
                        <li>Booking ID: ${booking._id}</li>
                        <li>Hotel: ${roomData.hotel.hotelName}</li>
                        <li>Room: ${roomData.roomType}</li>
                        <li>Check-in Date: ${checkInDate}</li>
                        <li>Check-out Date: ${checkOutDate}</li>
                        <li>Number of Rooms: ${persons}</li>
                        <li>Number of Nights: ${nights}</li>
                        ${roomDiscountActive ? 
                            `<li>Regular Price: ${process.env.CURRENCY || "₦"} ${(roomData.pricePerNight * nights * persons).toLocaleString('en-NG')}</li>
                             <li>Room Discount (${roomData.discountPercentage}%): -${process.env.CURRENCY || "₦"} ${roomDiscountAmount.toLocaleString('en-NG')}</li>` : ''
                        }
                        ${useLoyaltyDiscount ? 
                            `<li>Additional Loyalty Discount (${discountPercentage}%): -${process.env.CURRENCY || "₦"} ${(originalPrice * discountPercentage / 100).toLocaleString('en-NG')}</li>
                             <li>Loyalty Points Used: ${loyaltyPointsUsed}</li>` : ''
                        }
                        <li>Total Price: ${process.env.CURRENCY || "₦"} ${totalPrice.toLocaleString('en-NG')}</li>
                        ${(roomDiscountActive || useLoyaltyDiscount) ? 
                            `<li style="color: green; font-weight: bold;">Total Savings: ${process.env.CURRENCY || "₦"} ${((roomData.pricePerNight * nights * persons) - totalPrice).toLocaleString('en-NG')}</li>` : ''
                        }
                    </ul>
                    <p>You will earn 1 loyalty point when this booking is confirmed!</p>
                    <p>Best regards,<br>AnonStay Team</p>
                `,
        }

        await transporter.sendMail(mailOptions)

        // Return booking ID for immediate payment processing
        res.status(201).json({ 
            message: "Room booked successfully", 
            success: true, 
            bookingId: booking._id 
        })
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Api to get all user bookings
// Get /api/bookings/user
export const getUserBookings = async (req, res) => {
    try {
        const { id } = req.user
        const bookings = await Booking.find({ user: id }).populate("hotel room").sort({ createdAt: -1 })
        res.status(200).json({ message: "Bookings fetched successfully", success: true, bookings })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Api to get all bookings for the hotel
// Get /api/bookings/hotel
export const getHotelBookings = async (req, res) => {
    try {
        const { id } = req.user
        const hotels = await Hotel.find({ owner: id }).select("_id")
        if (!hotels) {
            return res.status(404).json({ message: "Hotel not found", success: false })
        }

        const hotelIds = hotels.map((hotel) => hotel._id)
        const bookings = await Booking.find({ hotel: { $in: hotelIds } }).populate("room hotel user").sort({ createdAt: -1})
        
        if(bookings.length === 0){
            return res.status(404).json({ message: "No bookings found", success: false })
        }else {
            res.status(200).json({ message: "Bookings fetched successfully", success: true, bookings })
        }
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Initialize Paystack Payment
export const initiatePaystackPayment = async (req, res) => {
    try {
        const { bookingId, callbackUrl } = req.body;
        const booking = await Booking.findById(bookingId).populate('user');

        if (!booking) {
            return res.status(404).json({ message: "Booking not found", success: false });
        }

        const reference = `booking_${bookingId}_${Date.now()}`;

        // determine appropriate callback URL
        const baseCallback = callbackUrl || req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";

        const initResponse = await axios.post(
            "https://api.paystack.co/transaction/initialize",
            {
                amount: Math.round(booking.totalPrice * 100),
                email: booking.user.email,
                reference,
                callback_url: `${baseCallback}/my-bookings`
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        await booking.updateOne({
            paymentReference: reference,
            paymentMethod: "Paystack"
        });

        res.status(200).json({
            message: "Payment initialized successfully",
            success: true,
            authorizationUrl: initResponse.data.data.authorization_url,
            reference
        });

    } catch (error) {
        console.log("Paystack init error:", error.response?.data || error);
        res.status(500).json({ message: "Internal Server Error", success: false });
    }
}

// Verify Paystack Payment
export const verifyPaystackPayment = async (req, res) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({
                message: "Payment reference is required",
                success: false
            });
        }

        const verifyResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
                }
            }
        );

        if (verifyResponse.data.data.status !== 'success') {
            return res.status(400).json({
                message: "Payment verification failed",
                success: false
            });
        }

        const bookingIdMatch = reference.match(/booking_([a-f\d]{24})_/);
        if (!bookingIdMatch) {
            return res.status(400).json({
                message: "Invalid payment reference",
                success: false
            });
        }

        const bookingId = bookingIdMatch[1];

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                isPaid: true,
                status: "confirmed",
                paymentReference: reference
            },
            { new: true }
        );

        if (booking) {
            await awardLoyaltyPoint(bookingId);
        }

        res.status(200).json({
            message: "Payment verified successfully",
            success: true
        });

    } catch (error) {
        console.log("💥 Paystack verification error:", error.response?.data || error);
        res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
}

// Api to update booking status and payment for hotel owners
// PUT /api/bookings/update-status/:bookingId
export const updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params
        const { status, isPaid } = req.body
        const { id } = req.user

        console.log(`📄 Updating booking ${bookingId}: status=${status}, isPaid=${isPaid}`);

        // Verify the booking belongs to owner's hotel
        const booking = await Booking.findById(bookingId).populate('hotel user room')
        if (!booking) {
            return res.status(404).json({ message: "Booking not found", success: false })
        }

        if (booking.hotel.owner.toString() !== id.toString()) {
            return res.status(403).json({ message: "Unauthorized", success: false })
        }

        // Prepare update object
        const updateData = {}
        if (status) updateData.status = status
        if (isPaid !== undefined) updateData.isPaid = isPaid

        // Award loyalty points when booking is confirmed (only if not already awarded)
        if (status === "confirmed" && booking.status !== "confirmed") {
            console.log(`🎯 Booking being confirmed, attempting to award loyalty point`);
            const loyaltyAwarded = await awardLoyaltyPoint(bookingId);
            if (!loyaltyAwarded) {
                console.log(`⚠️ Failed to award loyalty point during confirmation`);
            }
        }

        // Handle isPaid update - award points if booking becomes paid and confirmed
        if (isPaid === true && !booking.isPaid && (booking.status === "confirmed" || status === "confirmed")) {
            console.log(`💰 Booking marked as paid, attempting to award loyalty point`);
            if (status === "confirmed" || booking.status === "confirmed") {
                const loyaltyAwarded = await awardLoyaltyPoint(bookingId);
                if (!loyaltyAwarded) {
                    console.log(`⚠️ Failed to award loyalty point when marked as paid`);
                }
            }
        }

        // Handle cancellation logic with refund
        if (status === "cancelled") {
            console.log(`🚫 Booking being cancelled`);
            updateData.cancelledAt = new Date()
            
            // Refund loyalty points if they were used for this booking
            if (booking.loyaltyPointsUsed > 0) {
                await User.findByIdAndUpdate(booking.user._id, {
                    $inc: { loyaltyPoints: booking.loyaltyPointsUsed }
                })
                console.log(`🔄 Refunded ${booking.loyaltyPointsUsed} loyalty points to user`);
            }
            
            // For online payments, simulate a refund process
            if (booking.isPaid) {
                const now = new Date()
                const checkInDate = new Date(booking.checkIn)
                const timeDifference = checkInDate.getTime() - now.getTime()
                const hoursDifference = timeDifference / (1000 * 3600)
                
                let refundAmount = 0
                if (hoursDifference > 48) {
                    refundAmount = booking.totalPrice
                } else if (hoursDifference > 24) {
                    refundAmount = booking.totalPrice * 0.7
                } else {
                    refundAmount = booking.totalPrice * 0.3
                }

                updateData.refundInitiated = true
                updateData.refundAmount = refundAmount
                updateData.refundDate = new Date()
                updateData.refundStatus = "completed" // Mark as completed for online payments
                updateData.refundReference = `refund_${bookingId}_${Date.now()}`
            }
            
            // Send cancellation email
            const mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: booking.user.email,
                subject: "Booking Cancelled",
                html: `
                    <h1>Booking Cancellation Notice</h1>
                    <p>Hello ${booking.user.name},</p>
                    <p>Your booking has been cancelled by the hotel. Details:</p>
                    <ul>
                        <li>Booking ID: ${booking._id}</li>
                        <li>Hotel: ${booking.hotel.hotelName}</li>
                        <li>Room: ${booking.room.roomType}</li>
                        <li>Check-in Date: ${new Date(booking.checkIn).toLocaleDateString()}</li>
                        <li>Check-out Date: ${new Date(booking.checkOut).toLocaleDateString()}</li>
                        ${booking.loyaltyPointsUsed > 0 ? 
                            `<li>Loyalty Points Refunded: ${booking.loyaltyPointsUsed}</li>` : ''
                        }
                        ${updateData.refundInitiated ? 
                            `<li>Refund Amount: ₦${updateData.refundAmount?.toLocaleString('en-NG')}</li>
                             <li>Refund will be processed within 3-5 business days</li>` : ''
                        }
                    </ul>
                    <p>We apologize for any inconvenience caused.</p>
                    <p>Best regards,<br>AnonStay Team</p>
                `,
            }

            try {
                await transporter.sendMail(mailOptions)
            } catch (emailError) {
                console.log("Email sending failed:", emailError)
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        ).populate("room hotel user")

        console.log(`✅ Booking updated successfully: ${bookingId}`);

        res.status(200).json({ 
            message: status === "cancelled" ? "Booking cancelled successfully" : "Booking updated successfully", 
            success: true, 
            booking: updatedBooking 
        })
    } catch (error) {
        console.log("💥 Update booking error:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Api to confirm guest check-in
// PUT /api/bookings/check-in/:bookingId
export const confirmCheckIn = async (req, res) => {
    try {
        const { bookingId } = req.params
        const { id } = req.user

        console.log(`🏨 Confirming check-in for booking: ${bookingId}`);

        // Verify the booking belongs to owner's hotel
        const booking = await Booking.findById(bookingId).populate('hotel user room')
        if (!booking) {
            return res.status(404).json({ message: "Booking not found", success: false })
        }

        if (booking.hotel.owner.toString() !== id.toString()) {
            return res.status(403).json({ message: "Unauthorized", success: false })
        }

        // Check if booking is confirmed
        if (booking.status !== "confirmed") {
            // If checking in a pending booking, confirm it first and award points
            if (booking.status === "pending" && booking.isPaid) {
                console.log(`📋 Booking is pending but paid, confirming first`);
                await Booking.findByIdAndUpdate(bookingId, { status: "confirmed" })
                const loyaltyAwarded = await awardLoyaltyPoint(bookingId);
                if (!loyaltyAwarded) {
                    console.log(`⚠️ Failed to award loyalty point during pending->confirmed transition`);
                }
            } else {
                return res.status(400).json({ 
                    message: "Only confirmed bookings can be checked in", 
                    success: false 
                })
            }
        }

        if (!booking.isPaid) {
            return res.status(400).json({ 
                message: "Booking must be paid before check-in", 
                success: false 
            })
        }

        // Ensure loyalty point is awarded if not already done
        if ((booking.status === "confirmed" || booking.status === "pending") && booking.loyaltyPointAwarded !== true) {
            console.log(`🎯 Ensuring loyalty point is awarded before check-in`);
            const loyaltyAwarded = await awardLoyaltyPoint(bookingId);
            if (!loyaltyAwarded) {
                console.log(`⚠️ Failed to award loyalty point before check-in`);
            }
        }

        // Update booking status to checked-in
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { 
                status: "checked-in",
                checkedInAt: new Date()
            },
            { new: true }
        ).populate("room hotel user")

        console.log(`✅ Guest checked in successfully: ${bookingId}`);

        // Send check-in confirmation email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: booking.user.email,
            subject: "Check-in Confirmed",
            html: `
                <h1>Welcome to ${booking.hotel.hotelName}!</h1>
                <p>Hello ${booking.user.name},</p>
                <p>Your check-in has been confirmed. We hope you enjoy your stay!</p>
                <ul>
                    <li>Booking ID: ${booking._id}</li>
                    <li>Hotel: ${booking.hotel.hotelName}</li>
                    <li>Room: ${booking.room.roomType}</li>
                    <li>Check-in Date: ${new Date(booking.checkIn).toLocaleDateString()}</li>
                    <li>Check-out Date: ${new Date(booking.checkOut).toLocaleDateString()}</li>
                    <li>Checked in at: ${new Date().toLocaleString()}</li>
                </ul>
                <p>Have a wonderful stay!</p>
                <p>Best regards,<br>AnonStay Team</p>
            `,
        }

        try {
            await transporter.sendMail(mailOptions)
        } catch (emailError) {
            console.log("Email sending failed:", emailError)
        }

        res.status(200).json({ 
            message: "Guest checked in successfully", 
            success: true, 
            booking: updatedBooking 
        })
    } catch (error) {
        console.log("💥 Check-in error:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Api to search bookings for hotel owner
// GET /api/bookings/hotel/search
export const searchHotelBookings = async (req, res) => {
    try {
        const { id } = req.user
        const { search, status, paymentMethod, isPaid } = req.query

        // Get owner's hotels
        const hotels = await Hotel.find({ owner: id }).select("_id")
        if (!hotels.length) {
            return res.status(200).json({ 
                message: "No hotels found", 
                success: true, 
                bookings: [] 
            })
        }

        const hotelIds = hotels.map((hotel) => hotel._id)

        // Build base query
        let searchQuery = { hotel: { $in: hotelIds } }

        // Add filters
        if (status) searchQuery.status = status
        if (paymentMethod) searchQuery.paymentMethod = paymentMethod
        if (isPaid !== undefined) searchQuery.isPaid = isPaid === 'true'

        // Get all bookings with populated data
        let bookings = await Booking.find(searchQuery)
            .populate("room hotel user")
            .sort({ createdAt: -1 })

        // Apply text search filter on the populated results
        if (search && search.trim()) {
            const searchTerm = search.trim().toLowerCase()
            bookings = bookings.filter(booking => {
                // Search in booking ID
                if (booking._id.toString().toLowerCase().includes(searchTerm)) {
                    return true
                }
                
                // Search in hotel name
                if (booking.hotel && booking.hotel.hotelName && 
                    booking.hotel.hotelName.toLowerCase().includes(searchTerm)) {
                    return true
                }
                
                // Search in user name
                if (booking.user && booking.user.name && 
                    booking.user.name.toLowerCase().includes(searchTerm)) {
                    return true
                }
                
                // Search in user email
                if (booking.user && booking.user.email && 
                    booking.user.email.toLowerCase().includes(searchTerm)) {
                    return true
                }
                
                // Search in room type
                if (booking.room && booking.room.roomType && 
                    booking.room.roomType.toLowerCase().includes(searchTerm)) {
                    return true
                }
                
                return false
            })
        }

        res.status(200).json({ 
            message: "Search results fetched successfully", 
            success: true, 
            bookings: bookings || []
        })
    } catch (error) {
        console.log("Search bookings error:", error)
        res.status(500).json({ 
            message: "Internal Server Error", 
            success: false,
            bookings: []
        })
    }
}

// Api for users to cancel their own bookings (Enhanced with refund logic)
// PUT /api/bookings/cancel/:bookingId
export const cancelUserBooking = async (req, res) => {
    try {
        const { bookingId } = req.params
        const { cancellationReason } = req.body
        const { id } = req.user

        // Verify the booking belongs to the user
        const booking = await Booking.findById(bookingId).populate('hotel room user')
        if (!booking) {
            return res.status(404).json({ message: "Booking not found", success: false })
        }

        if (booking.user._id.toString() !== id.toString()) {
            return res.status(403).json({ message: "Unauthorized", success: false })
        }

        // Check if booking can be cancelled (e.g., not within 24 hours of check-in)
        const now = new Date()
        const checkInDate = new Date(booking.checkIn)
        const timeDifference = checkInDate.getTime() - now.getTime()
        const hoursDifference = timeDifference / (1000 * 3600)

        // Allow cancellation if check-in is more than 24 hours away
        if (hoursDifference <= 24) {
            return res.status(400).json({ 
                message: "Cannot cancel booking within 24 hours of check-in", 
                success: false 
            })
        }

        // Update booking status
        const updateData = {
            status: "cancelled",
            cancelledAt: new Date(),
            cancellationReason: cancellationReason || "Cancelled by user"
        }

        // Handle refund logic if booking was paid
        if (booking.isPaid) {
            // Calculate refund amount: full refund if more than 48h, otherwise 70%
            let refundAmount = booking.totalPrice;
            if (hoursDifference <= 48) {
                refundAmount = booking.totalPrice * 0.7;
            }

            updateData.refundInitiated = true;
            updateData.refundAmount = refundAmount;
            updateData.refundDate = new Date();

            // Attempt Paystack refund
            try {
                const refundRes = await axios.post(
                    'https://api.paystack.co/refund',
                    {
                        transaction: booking.paymentReference,
                        amount: Math.round(refundAmount * 100)
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                updateData.refundReference = refundRes.data.data.reference;
                updateData.refundStatus = refundRes.data.data.status === 'pending' ? 'initiated' : 'completed';
            } catch (refundError) {
                console.log('Refund error:', refundError.response?.data || refundError);
                updateData.refundFailed = true;
                updateData.refundFailReason = refundError.response?.data?.message || refundError.message;
                updateData.refundStatus = 'manual_required';
            }
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            updateData,
            { new: true }
        ).populate("room hotel user")

        // Send cancellation confirmation email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: booking.user.email,
            subject: "Booking Cancellation Confirmation",
            html: `
                <h1>Booking Cancellation Confirmed</h1>
                <p>Hello ${booking.user.name},</p>
                <p>Your booking has been successfully cancelled. Details:</p>
                <ul>
                    <li>Booking ID: ${booking._id}</li>
                    <li>Hotel: ${booking.hotel.hotelName}</li>
                    <li>Room: ${booking.room.roomType}</li>
                    <li>Original Check-in: ${new Date(booking.checkIn).toLocaleDateString()}</li>
                    <li>Original Check-out: ${new Date(booking.checkOut).toLocaleDateString()}</li>
                    <li>Cancellation Date: ${new Date().toLocaleDateString()}</li>
                    ${updateData.refundInitiated ? 
                        `<li>Refund Amount: ₦${updateData.refundAmount?.toLocaleString('en-NG')}</li>
                         <li>Refund will be processed within 3-5 business days</li>` : ''
                    }
                </ul>
                <p>The dates are now available for other guests to book.</p>
                <p>Best regards,<br>AnonStay Team</p>
            `,
        }

        try {
            await transporter.sendMail(mailOptions)
        } catch (emailError) {
            console.log("Email sending failed:", emailError)
        }

        res.status(200).json({ 
            message: "Booking cancelled successfully", 
            success: true, 
            booking: updatedBooking 
        })
    } catch (error) {
        console.log("Cancel booking error:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
