import Hotel from "../models/hotel.model.js";

// Register a new hotel

export const registerHotel = async (req, res) => {
    const { id } = req.user
    try {
        const { hotelName, hotelAddress, rating, price } = req.body
        const rawAmenities = req.body?.amenities
        const amenities = Array.isArray(rawAmenities)
            ? rawAmenities
            : rawAmenities
                ? [rawAmenities]
                : []
        const parsedRating = Number(rating)
        const parsedPrice = Number(price)
        const imageUrl = req.file?.path

        if (!hotelName?.trim() || !hotelAddress?.trim()) {
            return res.status(400).json({ message: "Hotel name and address are required", success: false })
        }

        if (!Number.isFinite(parsedRating) || parsedRating <= 0 || parsedRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5", success: false })
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: "Price must be greater than 0", success: false })
        }

        if (!amenities.length) {
            return res.status(400).json({ message: "Select at least one amenity", success: false })
        }

        if (!imageUrl) {
            return res.status(400).json({ message: "Hotel image is required", success: false })
        }

        const newHotel = new Hotel({
            hotelName: hotelName.trim(),
            hotelAddress: hotelAddress.trim(),
            rating: parsedRating,
            price: parsedPrice,
            amenities,
            image: imageUrl,
            owner: id,
        })
        await newHotel.save()
        return res.status(201).json({ message: "Hotel registered successfully", success: true })
    } catch (error) {
        console.error("registerHotel error:", error)
        return res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

// Get owner hotels
export const getOwnerHotels = async(req, res) => {
    const {id} = req.user
    try {
        const hotels = await Hotel.find({owner: id}).populate("owner", "name email phone")
        return res.status(200).json({ hotels, success: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", })
    }
}

// Get all hotels
export const getAllHotels = async(req, res) => {
    try {
        const hotels = await Hotel.find().populate("owner", "name email phone")
        return res.status(200).json({ hotels, success: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// Delete hotel
export const deleteHotel = async(req, res) => {
    const {hotelId} = req.params
    try {
        const deletedHotel = await Hotel.findByIdAndDelete(hotelId)
        if(!deletedHotel) {
            return res.status(404).json({ message: "Hotel not found" })
        }
        return res.status(200).json({ message: "Hotel deleted successfully", success: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}