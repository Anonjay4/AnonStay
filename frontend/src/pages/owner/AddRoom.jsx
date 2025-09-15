import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const AddRoom = () => {

    const { axios, navigate,  } = useContext(AppContext)
    const getInitialRoomState = () => ({
        hotel:"",
        roomType:"",
        description:"",
        pricePerNight:"",
        amenities:[],
        images:[],
        isAvailable: true,
    })
    const [ roomData, setRoomData ] = useState(getInitialRoomState)


    const [hotelData, setHotelData] = useState([]);
    
      const fetchOwnerHotels = async () => {
        try {
          const { data } = await axios.get("/api/hotel/get");
          if (data.success) {
            setHotelData(data.hotels);
          } else {
            toast.error(data.message)
          }
        } catch (error) {
          toast.error(error.message)
        }
      };
    
      useEffect(() => {
        fetchOwnerHotels()
      }, [])


    const handleChange = (e) => {
      const { name, value, type, checked } = e.target
      if (type === "checkbox" && name === "isAvailable") {
        setRoomData({ ...roomData, isAvailable: checked })
      } else {
        setRoomData({ ...roomData, [name]: value })
      }
    }

    const handleImageChange = (e, index) => {
      const file = e.target.files[0]
      if (file) {
        const updatedImages = [...roomData.images]
        updatedImages[index] = file
        setRoomData({ ...roomData, images: updatedImages })
      }
    }

    const amenitiesOptions = [
      "Ocean View" ,
      "Mountain View" ,
      "City View"  ,
      "Garden View"  ,
      "Balcony" ,
      "Mini Bar" ,
      "Room Service" ,
      "WiFi" ,
      "Premium Wifi" ,
      "Free WiFi" ,
      "Work Desk" ,
      "Concierge" ,
      "Concierge Service" ,
      "Breakfast Included" ,
      "Parking" ,
      "Valet" ,
      "Smart TV" ,
      "Spa" ,
      "Spa Access" ,
      "Pool" ,
      "Pool Access" ,
      "Free Breakfast" ,
      "Kitchen" ,
      "Restaurant" ,
      "Bar" ,
      "Living Area" ,
      "Private Terrace" ,
      "Butler Service" ,
      "Jacuzzi" ,
      "Panoramic View" ,
      "Beach Access" ,
      "Fireplace" ,
      "Gym" ,
      "Ski Access" ,
      "Business Center",
      "Garden",
      "Historic Tours"
    ];


    const handleSubmit = async(e) => {
        e.preventDefault()
        const selectedImages = roomData.images.filter(Boolean)

        if (!roomData.hotel) {
          toast.error("Please select the hotel this room belongs to")
          return
        }

        if (!roomData.roomType.trim()) {
          toast.error("Please provide a room type")
          return
        }

        if (!roomData.description.trim()) {
          toast.error("Please provide a room description")
          return
        }

        if (!roomData.pricePerNight || Number(roomData.pricePerNight) <= 0) {
          toast.error("Enter a valid price per night")
          return
        }

        if (!roomData.amenities.length) {
          toast.error("Select at least one room amenity")
          return
        }

        if (!selectedImages.length) {
          toast.error("Please upload at least one room image")
          return
        }

        const formData = new FormData()
        formData.append("hotel", roomData.hotel)
        formData.append("roomType", roomData.roomType.trim())
        formData.append("pricePerNight", roomData.pricePerNight)
        formData.append("description", roomData.description.trim())
        formData.append("isAvailable", roomData.isAvailable ? "true" : "false")
        roomData.amenities.forEach((amenity) => {
          formData.append("amenities", amenity)
        })

        selectedImages.forEach((imageFile) => {
          formData.append("images", imageFile)
        })

        try {
          const response = await axios.post("/api/room/add", formData, {
            headers: {
            "Content-Type": "multipart/form-data",
          },
          })
          if (response.data.success) {
            toast.success(response.data.message)
            setRoomData(getInitialRoomState())
            navigate("/owner/rooms")
          } else{
            toast.error(response.data.message)
          }
        } catch (error) {
          toast.error(error.response?.data?.message || error.message || "Failed to add room")
        }
    }

    return (
        <div className="py-10 flex flex-col justify-between  text-gray-100 bg-gradient-to-br from-[#fcae26]/40 to-gray-900 w-screen">
            <h1 className=' px-10 text-4xl font-bold text-gray-100 mb-2'>
              {" "}
              Add Room
            </h1>
            <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-medium">Room Images</p>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {Array(4).fill("").map((_,index) => (
                        <label key={index} htmlFor={`image${index}`}>
                          <input type="file" accept="image/*" id={`image${index}`} hidden onChange={(e) => handleImageChange(e, index)}/>
                          <img 
                            className="max-w-24 rounded-md cursor-pointer" 
                            src = {
                                roomData.images[index] 
                                ? URL.createObjectURL(roomData.images[index]) 
                                :"https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/e-commerce/uploadArea.png"
                            } 
                            alt="upload"
                            width={100}
                            height={100} 
                          />
                        </label>
                      ))}
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="hotel-name">Room Type</label>
                    <input name="roomType" value={roomData.roomType} onChange={handleChange} type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 text-gray-300 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="hotel-address">Room Description</label>
                    <textarea name="description" value={roomData.description} onChange={handleChange} rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here" required></textarea>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="product-price">Price/Night(₦)</label>
                        <div className="flex items-center rounded border border-gray-500/40">
                            <span className="text-gray-100 pl-1">₦</span>
                            <input name="pricePerNight" value={roomData.pricePerNight} onChange={handleChange} type="number" placeholder="0" className="outline-none md:py-2.5 py-2 pl-1 pr-2 w-full rounded  border-gray-500/40" required/>
                        </div>
                    </div>
                </div>
                {/* <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">Room Amenities</label>
                    <textarea name="amenities" value={roomData.amenities} onChange={handleChange} rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                </div> */}
                <div className="flex flex-col gap-3 max-w-md">
                  <label className="text-base font-medium">Room Amenities</label>
                  <div className="grid grid-cols-2 gap-2">
                      {amenitiesOptions.map((amenity) => (
                          <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                              <input
                                  type="checkbox"
                                  value={amenity}
                                  checked={roomData.amenities.includes(amenity)}
                                  onChange={(e) => {
                                      if (e.target.checked) {
                                          setRoomData({
                                              ...roomData,
                                              amenities: [...roomData.amenities, amenity]
                                          });
                                      } else {
                                          setRoomData({
                                              ...roomData,
                                              amenities: roomData.amenities.filter(a => a !== amenity)
                                          });
                                      }
                                  }}
                                  className="accent-[#fcae26] w-4 h-4"
                              />
                              <span>{amenity}</span>
                          </label>
                      ))}
                  </div>
              </div>
                <div className="w-full flex flex-col gap-1">
                  <label htmlFor="">
                    Select Hotel
                  </label>
                  <select name="hotel" value={roomData.hotel} onChange={handleChange}
                  className="outline-none md:py-2.5 py-2 px-3 rounded border bg-gray-800 cursor-pointer border-gray-500/40" required>
                    <option value="">
                      Select Hotel
                    </option>
                    {
                      hotelData.map((item) => (
                        <option key={item._id} value={item._id}> {item.hotelName} </option>
                      ))
                    }
                  </select>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                    <label className="text-base font-medium" htmlFor="isAvailable">Availability
                      <input
                        id="isAvailable"
                        type="checkbox"
                        name="isAvailable"
                        checked={roomData.isAvailable}
                        onChange={handleChange}
                        className="outline-none md:py-2.5 py-2 px-3 rounded border-gray-500/40 ml-2 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
                <button className="px-8 py-2.5 bg-[#fcae26] text-white font-medium rounded cursor-pointer">Add New Room</button>
            </form>
        </div>
    );
};
export default AddRoom