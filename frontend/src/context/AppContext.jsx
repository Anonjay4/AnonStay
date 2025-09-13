import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hotelsData, roomsData, hotelsPageData, roomsPageData } from "../assets/assets.js";
import axios from "axios";
import { toast } from "react-hot-toast";

axios.defaults.withCredentials = true
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

export const AppContext=createContext()

// Utility function to check if room discount is currently active
export const isRoomDiscountActive = (room) => {
    if (!room?.hasDiscount) return false;
    
    const now = new Date();
    const startDate = room.discountStartDate ? new Date(room.discountStartDate) : null;
    const endDate = room.discountEndDate ? new Date(room.discountEndDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
};

// Utility function to get current effective room price
export const getCurrentRoomPrice = (room) => {
    return isRoomDiscountActive(room) ? room.discountedPrice : room.pricePerNight;
};

// Utility function to get days remaining for discount
export const getDaysRemaining = (room) => {
    if (!isRoomDiscountActive(room) || !room?.discountEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(room.discountEndDate);
    const timeDiff = endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Function to process rooms with discount information
const processRoomsWithDiscountInfo = (rooms) => {
    return rooms.map(room => {
        const isDiscountCurrentlyActive = isRoomDiscountActive(room);
        const currentEffectivePrice = getCurrentRoomPrice(room);
        const daysRemaining = getDaysRemaining(room);
        
        return {
            ...room,
            isDiscountCurrentlyActive,
            currentEffectivePrice,
            daysRemaining
        };
    });
};

const AppContextProvider= (({children}) => {

    const navigate = useNavigate()
    const [user,setUser]=useState(null)
    const [owner,setOwner]=useState(null)
    const [hotelData, setHotelData] = useState([])
    const [hotelPageData, setHotelPageData] = useState([])
    const [roomData, setRoomData] = useState([])
    const [roomPageData, setRoomPageData] = useState([])

    const checkUserLoggedInOrNot = async () => {
        try {
            const { data } = await axios.get("/api/user/is-auth");
            if (data.success) {
                setUser(true);
            } else {
                setUser(false);
            }
        } catch (error) {
            console.log("error", error);
            setUser(false);
        }
    };

    const checkOwnerLoggedInOrNot = async () => {
        try {
            const { data } = await axios.get("/api/user/is-auth-owner");
            if (data.success) {
                setOwner(data.owner);
            } else {
                setOwner(false);
            }
        } catch (error) {
            console.log("error", error);
            setOwner(false);
        }
    };

    const fetchHotelsData = async () => {
        try {
            const { data } = await axios.get("/api/hotel/get-all")
            if (data.success) {
                setHotelPageData(data.hotels)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchHotelsPageData = async () => {
        try {
            const { data } = await axios.get("/api/hotel/get-all")
            if (data.success) {
                setHotelData(data.hotels)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchRoomsData = async () => {
        try {
            const { data } = await axios.get("/api/room/get-all")
            if (data.success) {
                setRoomData(data.rooms)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const fetchRoomsPageData = async () => {
        try {
        const { data } = await axios.get("/api/room/get-all")
        if (data.success) {
            setRoomPageData(data.rooms)
        } else {
            toast.error(data.message)
        }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const refreshRoomData = async () => {
        await Promise.all([fetchRoomsData(), fetchRoomsPageData()]);
    };

    useEffect(() => {
        checkUserLoggedInOrNot()
        checkOwnerLoggedInOrNot()
        fetchHotelsData()
        fetchRoomsData()
        fetchHotelsPageData()
        fetchRoomsPageData()
    }, [])

    const value={ 
        navigate, 
        user, 
        setUser, 
        owner, 
        setOwner, 
        hotelData, 
        roomData, 
        hotelPageData, 
        roomPageData, 
        axios,
        refreshRoomData,
        isRoomDiscountActive,
        getCurrentRoomPrice,
        getDaysRemaining
    }
    
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
})

export default AppContextProvider;