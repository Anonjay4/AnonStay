import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomType: {
        type: String,
        required: true,
    },
    hotel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
    },
    pricePerNight: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    amenities: {
        type: [String],
        default: [],
        required: true,
    },
    images: {
        type: [String],
        default: [],
        required: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    // Discount fields
    hasDiscount: {
        type: Boolean,
        default: false
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 90,
        default: 0
    },
    discountedPrice: {
        type: Number,
        default: 0
    },
    discountStartDate: {
        type: Date,
        default: null
    },
    discountEndDate: {
        type: Date,
        default: null
    },
    discountTitle: {
        type: String,
        default: "Limited Time Offer"
    }
}, { timestamps: true });

// Index for discount queries
roomSchema.index({ hasDiscount: 1, discountStartDate: 1, discountEndDate: 1 });

// Virtual to check if discount is currently active
roomSchema.virtual('isDiscountActive').get(function() {
    if (!this.hasDiscount) return false;
    
    const now = new Date();
    const startDate = this.discountStartDate ? new Date(this.discountStartDate) : null;
    const endDate = this.discountEndDate ? new Date(this.discountEndDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
});

// Virtual to get current effective price
roomSchema.virtual('currentPrice').get(function() {
    return this.isDiscountActive ? this.discountedPrice : this.pricePerNight;
});

const Room = mongoose.model("Room", roomSchema);
export default Room;