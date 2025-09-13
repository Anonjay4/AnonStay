import express from "express"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import { isOwner } from "../middlewares/isOwner.js"
import { upload } from "../config/multer.js"
import { 
    addRoom, 
    deleteRoom, 
    getAllRooms, 
    getOwnerRooms, 
    getRoomsByHotel,
    updateRoomPrice,
    updateRoomDiscount,
    removeRoomDiscount
} from "../controllers/room.controller.js"

const roomRouter = express.Router()

// Existing routes
roomRouter.post("/add", upload.array("images"), isAuthenticated, isOwner, addRoom)
roomRouter.get("/get", isAuthenticated, isOwner, getOwnerRooms)
roomRouter.get("/get-all", getAllRooms)
roomRouter.delete("/delete/:roomId", isAuthenticated, isOwner, deleteRoom)
roomRouter.get("/hotel/:hotelId", getRoomsByHotel)

// New routes for price and discount management
roomRouter.put("/update-price/:roomId", isAuthenticated, isOwner, updateRoomPrice)
roomRouter.put("/update-discount/:roomId", isAuthenticated, isOwner, updateRoomDiscount)
roomRouter.delete("/remove-discount/:roomId", isAuthenticated, isOwner, removeRoomDiscount)

export default roomRouter