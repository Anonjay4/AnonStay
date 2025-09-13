// services/bookingScheduler.js
import cron from 'node-cron'
import Booking from '../models/booking.model.js'
import User from '../models/user.model.js' 
import transporter from '../config/nodemailer.js'

// Function to check and update booking statuses
const checkBookingStatuses = async () => {
    try {
        const now = new Date()
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
        
        // Auto-confirm paid bookings on check-in day if not already processed
        const bookingsToAutoConfirm = await Booking.find({
            checkIn: {
                $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
            },
            status: 'pending',
            isPaid: true
        }).populate('user hotel room')

        for (const booking of bookingsToAutoConfirm) {
            await Booking.findByIdAndUpdate(booking._id, {
                status: 'confirmed',
                autoConfirmedAt: now,
                loyaltyPointAwarded: true // Add this field
            })

            // Award loyalty point for auto-confirmed booking
            await User.findByIdAndUpdate(booking.user._id, {
                $inc: { loyaltyPoints: 1 }
            })

            const confirmEmail = {
                from: process.env.SENDER_EMAIL,
                to: booking.user.email,
                subject: "Booking Auto-Confirmed - Check-in Today!",
                html: `
                    <h1>Your Booking is Confirmed!</h1>
                    <p>Hello ${booking.user.name},</p>
                    <p>Your booking has been automatically confirmed as today is your check-in day.</p>
                    <ul>
                        <li>Booking ID: ${booking._id}</li>
                        <li>Hotel: ${booking.hotel.hotelName}</li>
                        <li>Room: ${booking.room.roomType}</li>
                        <li>Check-in: Today!</li>
                        <li>Check-out: ${new Date(booking.checkOut).toLocaleDateString()}</li>
                    </ul>
                    <p>You've earned 1 loyalty point for this booking!</p>
                    <p>Please proceed to the hotel for check-in.</p>
                    <p>Best regards,<br>AnonStay Team</p>
                `
            }

            try {
                await transporter.sendMail(confirmEmail)
            } catch (emailError) {
                console.log("Failed to send auto-confirmation email:", emailError)
            }
        }

        // Rest of the function remains the same...
        // Find bookings that should be marked as no-show
        const noShowBookings = await Booking.find({
            checkIn: { $lt: yesterday },
            status: 'confirmed',
            isPaid: true,
            checkedInAt: null
        }).populate('user hotel room')

        // Lock bookings after 48 hours past check-in
        const bookingsToLock = await Booking.find({
            checkIn: { $lt: twoDaysAgo },
            status: { $in: ['confirmed', 'checked-in'] },
            isLocked: { $ne: true }
        })

        // Find bookings that should expire
        const expiredBookings = await Booking.find({
            checkIn: { $lt: now },
            status: { $in: ['pending'] },
            isPaid: false
        }).populate('user hotel room')

        console.log(`Processing: ${bookingsToAutoConfirm.length} auto-confirmations, ${noShowBookings.length} no-shows, ${bookingsToLock.length} to lock, ${expiredBookings.length} expired`)

        // Mark as no-show
        for (const booking of noShowBookings) {
            await Booking.findByIdAndUpdate(booking._id, {
                status: 'no-show',
                noShowMarkedAt: now,
                isLocked: true
            })

            const noShowEmailToGuest = {
                from: process.env.SENDER_EMAIL,
                to: booking.user.email,
                subject: "Booking Marked as No-Show",
                html: `
                    <h1>Booking No-Show Notice</h1>
                    <p>Hello ${booking.user.name},</p>
                    <p>Your booking has been automatically marked as a no-show as you did not check in within 24 hours of your scheduled check-in time.</p>
                    <ul>
                        <li>Booking ID: ${booking._id}</li>
                        <li>Hotel: ${booking.hotel.hotelName}</li>
                        <li>Room: ${booking.room.roomType}</li>
                        <li>Scheduled Check-in: ${new Date(booking.checkIn).toLocaleDateString()}</li>
                    </ul>
                    <p>No refund will be processed for no-show bookings.</p>
                    <p>If you believe this is an error, please contact the hotel directly.</p>
                    <p>Best regards,<br>AnonStay Team</p>
                `
            }

            try {
                await transporter.sendMail(noShowEmailToGuest)
            } catch (emailError) {
                console.log("Failed to send no-show email:", emailError)
            }
        }

        // Lock old bookings
        for (const booking of bookingsToLock) {
            await Booking.findByIdAndUpdate(booking._id, {
                isLocked: true,
                lockedAt: now
            })
        }

        // Mark as expired
        for (const booking of expiredBookings) {
            await Booking.findByIdAndUpdate(booking._id, {
                status: 'expired',
                expiredAt: now,
                isLocked: true
            })

            const expiredEmail = {
                from: process.env.SENDER_EMAIL,
                to: booking.user.email,
                subject: "Booking Expired",
                html: `
                    <h1>Booking Expired</h1>
                    <p>Hello ${booking.user.name},</p>
                    <p>Your unpaid booking has expired as the check-in date has passed.</p>
                    <ul>
                        <li>Booking ID: ${booking._id}</li>
                        <li>Hotel: ${booking.hotel.hotelName}</li>
                        <li>Room: ${booking.room.roomType}</li>
                        <li>Check-in Date: ${new Date(booking.checkIn).toLocaleDateString()}</li>
                    </ul>
                    <p>The room is now available for other guests.</p>
                    <p>Best regards,<br>AnonStay Team</p>
                `
            }

            try {
                await transporter.sendMail(expiredEmail)
            } catch (emailError) {
                console.log("Failed to send expiration email:", emailError)
            }
        }

    } catch (error) {
        console.error('Error in booking status check:', error)
    }
}

// Schedule the task to run every hour
export const startBookingScheduler = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running booking status check...')
        await checkBookingStatuses()
    })

    // Also run at midnight for daily processing
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily booking status check...')
        await checkBookingStatuses()
    })

    // Run once on startup
    checkBookingStatuses()
    
    console.log('Booking scheduler started - checking every hour')
}

export default { startBookingScheduler }