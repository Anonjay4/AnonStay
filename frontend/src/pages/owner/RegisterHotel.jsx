import { useState } from "react";
import { Star } from 'lucide-react'
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast";

const RegisterHotel = () => {

    const { axios, navigate } = useContext(AppContext)
    const getInitialFormState = () => ({
        hotelName:"",
        hotelAddress:"",
        rating:"",
        price:"",
        amenities:[],
        image:null,
    })
    const [ data, setData ] = useState(getInitialFormState)
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


    const [ file, setFile ] = useState(null)
    const [ preview, setPreview ] = useState(null)

    const handleChange = (e) => {let { name, value } = e.target;

  if (name === "rating") {
    let num = parseFloat(value);

    // Prevent values outside the range
    if (num > 5) num = 5;
    if (num < 0) num = 0;

    setData({ ...data, [name]: num });
  } else {
    setData({ ...data, [name]: value });
  }
    }

    const handleImageChange = (e) => {
        const selectedFile = e.target.files[0]
        setFile(selectedFile)
        setData({ ...data, image:selectedFile })
        if(selectedFile){
            const imageUrl = URL.createObjectURL(selectedFile)
            setPreview(imageUrl)
        }
    }

    const handleSubmit = async(e) => {
        e.preventDefault()

        if (!file) {
            toast.error("Please upload a hotel image")
            return
        }

        if (!data.amenities.length) {
            toast.error("Select at least one amenity")
            return
        }

        if (!data.rating || Number(data.rating) <= 0 || Number(data.rating) > 5) {
            toast.error("Please provide a rating between 1 and 5")
            return
        }

        const payload = new FormData()
        payload.append("hotelName", data.hotelName.trim())
        payload.append("hotelAddress", data.hotelAddress.trim())
        payload.append("rating", data.rating)
        payload.append("price", data.price)
        data.amenities.forEach((amenity) => {
          payload.append("amenities", amenity)
        })
        payload.append("image", file)

        try {
            const response = await axios.post("/api/hotel/register", payload)
            if (response.data.success) {
                toast.success(response.data.message)
                setData(getInitialFormState())
                setFile(null)
                setPreview(null)
                navigate("/owner")
            } else{
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to register hotel")
        }
    }

    return (
        <div className="py-10 flex flex-col justify-between text-gray-100 bg-gradient-to-br from-[#fcae26]/40 to-gray-900 w-screen">
            <h1 className=' px-10 text-4xl font-bold text-gray-100 mb-2'>
              {" "}
              Register a Hotel
            </h1>
            <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-medium">Hotel Image</p>
                    <div className="w-full my-4">
                        {/* Hotel Image Preview */}
                        {preview &&(
                            <div className="mb-3 flex justify-center">
                                <img src={preview} alt="" className="w-24 h-24 object-cover rounded shadow"/>
                            </div>
                        )}
                        
                        {/* File Upload Input */}
                        <input type="file" accept="image/*" onChange={handleImageChange}
                            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-100 file:text-yellow-800 hover:file:bg-yellow-200 file:cursor-pointer cursor-pointer"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="hotel-name">Hotel Name</label>
                    <input name="hotelName" value={data.hotelName} onChange={handleChange} type="text" placeholder="Type here" className="outline-none md:py-2.5 py-2 px-3 text-gray-300 rounded border border-gray-500/40" required />
                </div>
                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="hotel-address">Hotel Address</label>
                    <textarea name="hotelAddress" value={data.hotelAddress} onChange={handleChange} rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium flex items-center gap-1" htmlFor="product-price">Rating <Star className="w-4 h-4 text-amber-400 fill-current"/> </label>
                        <input name="rating" value={data.rating} onChange={handleChange} type="number" placeholder="0" min="0.1" max="5" step="0.1"className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                </div>
                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="product-price">Price(₦)</label>
                        <div className="flex items-center rounded border border-gray-500/40">
                            <span className="text-gray-100 pl-1">₦</span>
                            <input name="price" value={data.price} onChange={handleChange} type="number" placeholder="0" className="outline-none md:py-2.5 py-2 pl-1 pr-2 w-full rounded  border-gray-500/40" required/>
                        </div>
                    </div>
                </div>
                {/* <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-base font-medium" htmlFor="product-description">Hotel Amenities</label>
                    <textarea name="amenities" value={data.amenities} onChange={handleChange} rows={4} className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" placeholder="Type here"></textarea>
                </div> */}
                <div className="flex flex-col gap-3 max-w-md">
                    <label className="text-base font-medium">Hotel Amenities</label>
                    <div className="grid grid-cols-2 gap-2">
                        {amenitiesOptions.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                            <input
                            type="checkbox"
                            value={amenity}
                            checked={data.amenities.includes(amenity)}
                            onChange={(e) => {
                                if (e.target.checked) {
                                setData({
                                    ...data,
                                    amenities: [...data.amenities, amenity],
                                });
                                } else {
                                setData({
                                    ...data,
                                    amenities: data.amenities.filter((a) => a !== amenity),
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

                <button className="px-8 py-2.5 bg-[#fcae26] text-white font-medium rounded cursor-pointer">Register Hotel</button>
            </form>
        </div>
    );
};
export default RegisterHotel