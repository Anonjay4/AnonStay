import Room from "../models/room.model.js";

// Add new room
export const addRoom = async (req, res) => {
    try {
        const { roomType, hotel, pricePerNight, description, isAvailable } = req.body
        const rawAmenities = req.body?.amenities
        const amenities = Array.isArray(rawAmenities)
            ? rawAmenities
            : rawAmenities
                ? [rawAmenities]
                : []
        const imageFiles = req.files || []
        const uploadedImages = imageFiles.map((file) => file.path)
        const parsedPrice = Number(pricePerNight)
        const availability = typeof isAvailable === "string"
            ? ["true", "1", "on", "yes"].includes(isAvailable.toLowerCase())
            : Boolean(isAvailable)

        if (!roomType?.trim()) {
            return res.status(400).json({ message: "Room type is required", success: false })
        }

        if (!hotel) {
            return res.status(400).json({ message: "Please select the hotel this room belongs to", success: false })
        }

        if (!description?.trim()) {
            return res.status(400).json({ message: "Room description is required", success: false })
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: "Price per night must be greater than 0", success: false })
        }

        if (!amenities.length) {
            return res.status(400).json({ message: "Select at least one room amenity", success: false })
        }

        if (!uploadedImages.length) {
            return res.status(400).json({ message: "Upload at least one room image", success: false })
        }

        const newRoom = await Room.create({
            roomType: roomType.trim(),
            hotel,
            pricePerNight: parsedPrice,
            description: description.trim(),
            amenities,
            isAvailable: availability,
            images: uploadedImages,
        })
        await newRoom.save()
        return res.status(201).json({ message: "Room added successfully", success: true })
    } catch (error) {
        console.error("addRoom error:", error)
        return res.status(500).json({ message: "Internal Server Error", success: false })
    }
}

// Get all rooms for a specific owner
export const getOwnerRooms = async (req, res) => {
    const { id } = req.user
    try {
        const rooms = await Room.find().populate({
            path: "hotel",
            match: {owner: id},
            select: "hotelName hotelAddress rating amenities owner"
        })
        
        // Filter rooms that belong to the owner and add discount status
        const ownerRooms = rooms
            .filter((room) => room.hotel && room.hotel.owner.toString() === id)
            .map(room => {
                const roomObj = room.toObject({ virtuals: true }); // Include virtuals
                
                // Add explicit discount status calculation for frontend
                const now = new Date();
                const isDiscountCurrentlyActive = room.hasDiscount && 
                    (!room.discountStartDate || now >= new Date(room.discountStartDate)) &&
                    (!room.discountEndDate || now <= new Date(room.discountEndDate));
                
                return {
                    ...roomObj,
                    isDiscountCurrentlyActive,
                    currentEffectivePrice: isDiscountCurrentlyActive ? room.discountedPrice : room.pricePerNight
                };
            });
        
        return res.status(200).json({ 
            rooms: ownerRooms, 
            success: true 
        })
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

// Get all rooms for users
export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate({
            path: "hotel",
            select: "hotelName hotelAddress rating amenities owner",
            populate: {
                path: "owner",
                select: "name email phone"
            },
        })
        .exec()

        
        const roomsWithDiscountStatus = rooms.map(room => {
            const roomObj = room.toObject({ virtuals: true }); 
            const now = new Date();
            const isDiscountCurrentlyActive = room.hasDiscount && 
                (!room.discountStartDate || now >= new Date(room.discountStartDate)) &&
                (!room.discountEndDate || now <= new Date(room.discountEndDate));
            
            return {
                ...roomObj,
                isDiscountCurrentlyActive,
                currentEffectivePrice: isDiscountCurrentlyActive ? room.discountedPrice : room.pricePerNight
            };
        });

        res.status(200).json({ 
            message: "Rooms fetched successfully",
            rooms: roomsWithDiscountStatus, 
            success: true 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Delete a room
export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params
        const deletedRoom = await Room.findByIdAndDelete(roomId)
        if (!deletedRoom) {
            res.status(404).json({ message: "Room not found", success: false })
        }
        res.status(200).json({ message: "Room deleted successfully", success: true })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Get rooms by hotel ID
// GET /api/room/hotel/:hotelId
export const getRoomsByHotel = async (req, res) => {
    try {
        const { hotelId } = req.params
        const rooms = await Room.find({ hotel: hotelId }).populate('hotel')
        
        if (rooms.length === 0) {
            return res.status(404).json({ 
                message: "No rooms found for this hotel", 
                success: false 
            })
        }

        
        const roomsWithDiscountStatus = rooms.map(room => {
            const roomObj = room.toObject({ virtuals: true }); 
            const now = new Date();
            const isDiscountCurrentlyActive = room.hasDiscount && 
                (!room.discountStartDate || now >= new Date(room.discountStartDate)) &&
                (!room.discountEndDate || now <= new Date(room.discountEndDate));
            
            return {
                ...roomObj,
                isDiscountCurrentlyActive,
                currentEffectivePrice: isDiscountCurrentlyActive ? room.discountedPrice : room.pricePerNight
            };
        });

        res.status(200).json({ 
            message: "Rooms fetched successfully", 
            success: true, 
            rooms: roomsWithDiscountStatus
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Update room price
// PUT /api/room/update-price/:roomId
export const updateRoomPrice = async (req, res) => {
    try {
        const { roomId } = req.params
        const { pricePerNight } = req.body
        const { id } = req.user

        if (!pricePerNight || pricePerNight <= 0) {
            return res.status(400).json({ 
                message: "Valid price is required", 
                success: false 
            })
        }

        // Verify room ownership
        const room = await Room.findById(roomId).populate('hotel')
        if (!room) {
            return res.status(404).json({ message: "Room not found", success: false })
        }

        if (room.hotel.owner.toString() !== id.toString()) {
            return res.status(403).json({ message: "Unauthorized", success: false })
        }

        // Update price and recalculate discounted price if discount exists
        const updateData = { pricePerNight }
        if (room.hasDiscount && room.discountPercentage > 0) {
            updateData.discountedPrice = pricePerNight * (1 - room.discountPercentage / 100)
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            roomId, 
            updateData, 
            { new: true }
        )

        res.status(200).json({ 
            message: "Room price updated successfully", 
            success: true, 
            room: updatedRoom 
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Add or update room discount
// PUT /api/room/update-discount/:roomId
export const updateRoomDiscount = async (req, res) => {
    try {
        const { roomId } = req.params
        const { 
            discountPercentage, 
            discountStartDate, 
            discountEndDate, 
            discountTitle = "Limited Time Offer" 
        } = req.body
        const { id } = req.user

        // Validation
        if (!discountPercentage || discountPercentage <= 0 || discountPercentage > 90) {
            return res.status(400).json({ 
                message: "Discount percentage must be between 1-90%", 
                success: false 
            })
        }

        if (!discountStartDate || !discountEndDate) {
            return res.status(400).json({ 
                message: "Start and end dates are required", 
                success: false 
            })
        }

        const startDate = new Date(discountStartDate)
        const endDate = new Date(discountEndDate)
        
        if (startDate >= endDate) {
            return res.status(400).json({ 
                message: "End date must be after start date", 
                success: false 
            })
        }

        // Verify room ownership
        const room = await Room.findById(roomId).populate('hotel')
        if (!room) {
            return res.status(404).json({ 
                message: "Room not found", 
                success: false 
            })
        }

        if (room.hotel.owner.toString() !== id.toString()) {
            return res.status(403).json({ 
                message: "Unauthorized", 
                success: false 
            })
        }

        // Calculate discounted price
        const discountedPrice = room.pricePerNight * (1 - discountPercentage / 100)

        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            {
                hasDiscount: true,
                discountPercentage: Number(discountPercentage),
                discountedPrice: Number(discountedPrice.toFixed(2)),
                discountStartDate: startDate,
                discountEndDate: endDate,
                discountTitle: discountTitle.trim()
            },
            { new: true }
        ).populate('hotel')

        // Make sure we return a proper JSON response
        res.status(200).json({ 
            message: "Room discount added successfully", 
            success: true, 
            room: updatedRoom 
        })
    } catch (error) {
        console.error('Discount update error:', error)
        res.status(500).json({ 
            message: "Internal Server Error: " + error.message, 
            success: false 
        })
    }
}

// Remove room discount
// DELETE /api/room/remove-discount/:roomId
export const removeRoomDiscount = async (req, res) => {
    try {
        const { roomId } = req.params
        const { id } = req.user

        // Verify room ownership
        const room = await Room.findById(roomId).populate('hotel')
        if (!room) {
            return res.status(404).json({ message: "Room not found", success: false })
        }

        if (room.hotel.owner.toString() !== id.toString()) {
            return res.status(403).json({ message: "Unauthorized", success: false })
        }

        const updatedRoom = await Room.findByIdAndUpdate(
            roomId,
            {
                hasDiscount: false,
                discountPercentage: 0,
                discountedPrice: 0,
                discountStartDate: null,
                discountEndDate: null,
                discountTitle: "Limited Time Offer"
            },
            { new: true }
        )

        res.status(200).json({ 
            message: "Room discount removed successfully", 
            success: true, 
            room: updatedRoom 
        })
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" })
    }
}