import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { motion } from 'framer-motion';
import { CircleUserRound, MapPin, Star, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getImageSrc } from '../../utils/image';

const AllHotels = () => {
  const { navigate, axios } = useContext(AppContext);
  const [hotelData, setHotelData] = useState([]);

  const fetchOwnerHotels = async () => {
    try {
      const { data } = await axios.get("api/hotel/get");
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

  const deleteHotel = async(id) => {
    try {
      const { data } = await axios.delete(`api/hotel/delete/${id}`)
      if (data.success) {
        toast.success(data.message)
        fetchOwnerHotels()
      }else {
        toast.error(data.message)
      }
    } catch (error) {
        toast.error(error.message)
    }
  }

  const formatPhone = (phone) => {
    if (!phone) return "";
    
    // Remove non-digits just in case
    const digits = phone.replace(/\D/g, "");
    
    // Expect format: +234XXXXXXXXXX (13 characters)
    if (digits.length === 13) {
      return `+${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)} ${digits.substring(9)}`;
    }
    
    return phone; // fallback
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fcae26]/40 to-gray-900 p-6 flex w-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 rounded-2xl shadow-2xl p-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-100 mb-2">
              Premium Hotels Collection
            </h1>
            <p className="text-gray-300">
              Discover exceptional stays around the world
            </p>
          </div>
          <motion.button
            className="bg-[#fcae26] text-white px-6 py-[6px] rounded-md cursor-pointer"
            onClick={() => navigate('/owner/register-hotel')}
            whileHover={{ scale: 1.05 }}
            transition={{ ease: 'easeInOut', duration: 0.3 }}
          >
            Register Hotel
          </motion.button>
        </div>

        {/* Hotels Table for md+ screens */}
        <div className="hidden lg:block bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-yellow-600 to-orange-600 text-gray-200">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Hotel
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Hotel Owner
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Price/Night
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Amenities
                  </th>
                  <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-400">
                {hotelData.map((hotel, index) => (
                  <tr
                    key={hotel._id}
                    className={`hover:bg-yellow-600/30 transition-all duration-200 ${
                      index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-950'
                    }`}
                  >
                    <td className="py-6 px-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={getImageSrc(hotel.image)}
                          alt={hotel.hotelName}
                          className="w-20 h-16 rounded-xl object-cover shadow-md"
                        />
                        <h3 className="text-lg font-semibold text-gray-200 hover:text-yellow-600 transition-colors">
                          {hotel.hotelName}
                        </h3>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">
                          {hotel.hotelAddress}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-start space-x-2">
                        <CircleUserRound className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                        <span className="text-gray-300 text-sm leading-relaxed">
                          {hotel.owner.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-gray-300 text-sm leading-relaxed">
                        {formatPhone(hotel.owner.phone)}
                      </span>
                    </td>
                    <td className="py-6 px-4">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span className="text-gray-300 text-sm">{hotel.rating}</span>
                      </div>
                    </td>
                    <td className="py-6 px-4">
                      <span className="text-green-600 text-xl font-bold">
                        ₦{Number(hotel.price).toLocaleString('en-NG')}
                      </span>
                    </td>
                    <td className="py-6 px-2">
                      <div className="flex flex-wrap w-full gap-1">
                        {hotel.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100/50 text-yellow-500 text-xs rounded-full font-medium cursor-pointer hover:bg-[#fcae26] hover:text-white"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-6 px-2">
                      <button onClick={()=>deleteHotel(hotel._id)} className="bg-red-500 text-white py-1 px-3 rounded-full cursor-pointer flex items-center gap-1">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card View for small screens */}
        <div className="block lg:hidden space-y-4">
          {hotelData.map((hotel) => (
            <div
              key={hotel._id}
              className="bg-gray-800 rounded-xl shadow-xl p-4 flex flex-col space-y-4"
            >
              <img
                src={getImageSrc(hotel.image)}
                alt={hotel.hotelName}
                className="w-full h-40 rounded-lg object-cover"
              />
                <img
                  src={getImageSrc(hotel.image)}
                  alt={hotel.hotelName}
                  className="w-full h-40 rounded-lg object-cover"
                />
              <div>
                <h3 className="text-xl font-bold text-gray-200">{hotel.hotelName}</h3>
                <p className="text-gray-400 flex items-center gap-1 text-sm">
                  <MapPin className="w-4 h-4" /> {hotel.hotelAddress}
                </p>
              </div>
              <div className="flex justify-between text-gray-300 text-sm">
                <span className="flex items-center gap-1">
                  <CircleUserRound className="w-4 h-4" /> {hotel.owner.name}
                </span>
                <span>{formatPhone(hotel.owner.phone)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-amber-400 fill-c">
                  <Star className="w-4 h-4 fill-current" /> {hotel.rating}
                </div>
                <span className="text-green-600 font-bold">₦{Number(hotel.price).toLocaleString('en-NG')}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-100/50 text-yellow-500 text-xs rounded-full cursor-pointer hover:bg-[#fcae26] hover:text-white"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
              <button onClick={ () => deleteHotel( hotel._id ) } className="bg-red-500 text-white py-2 px-4 rounded-full flex items-center justify-center gap-1">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllHotels;
