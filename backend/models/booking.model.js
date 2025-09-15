import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    persons: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "checked-in", "no-show", "expired"],
        default: "pending",
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    paymentMethod: {
        type: String,
        default: "Pay At Hotel",
        enum: ["Pay At Hotel", "Paystack"],
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paymentReference: {
        type: String,
        default: null
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    cancellationReason: {
        type: String,
        default: null
    },
    refundInitiated: {
        type: Boolean,
        default: false
    },
    refundDate: {
        type: Date,
        default: null
    },
    refundAmount: {
        type: Number,
        default: null
    },
    refundReference: {
        type: String,
        default: null
    },
    refundStatus: {
        type: String,
        enum: ["initiated", "completed", "manual_required"],
        default: null
    },
    refundFailed: {
        type: Boolean,
        default: false
    },
    refundFailReason: {
        type: String,
        default: null
    },
    checkedInAt: {
        type: Date,
        default: null
    },
    noShowMarkedAt: {
        type: Date,
        default: null
    },
    expiredAt: {
        type: Date,
        default: null
    },
    loyaltyPointsUsed: {
        type: Number,
        default: 0,
        min: 0
    },
    discountApplied: {
        type: Number,
        default: 0,
        min: 0,
        max: 50 // Maximum 50% discount
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockedAt: {
        type: Date,
        default: null
    },
    autoConfirmedAt: {
        type: Date,
        default: null
    },
    loyaltyPointAwarded: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

bookingSchema.index({ room: 1, status: 1, checkIn: 1, checkOut: 1 })
bookingSchema.index({ checkIn: 1, status: 1 }) // Index for cron job queries

const Booking = mongoose.model("Booking", bookingSchema)
export default Booking
