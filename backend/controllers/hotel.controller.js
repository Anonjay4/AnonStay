import Hotel from "../models/hotel.model.js";

// Register a new hotel

export const registerHotel = async(req, res) => {
    const {id} = req.user
    try {
        const { hotelName, hotelAddress, rating, price, amenities } = req.body
        const image = req.file?.path
        if(!hotelName || !hotelAddress || !rating || !price || !amenities || !image) {
            return res.status(400).json({ message: "All fields are required", success: false })
        }

        const newHotel = new Hotel({
            hotelName,
            hotelAddress,
            rating,
            price,
            amenities,
            image,
            owner: id,
        })
        await newHotel.save()
        return res.status(201).json({ message: "Hotel registered successfully", success: true })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
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