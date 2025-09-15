import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { motion } from "framer-motion"
import { CircleUserRound, MapPin, Star, Trash2, Edit2, Tag, Clock } from 'lucide-react'
import {toast} from 'react-hot-toast'
import RoomManagementModal from '../../components/RoomManagementModal'
import { getImageSrc } from '../../utils/image'

const AllRooms = () => {
  const { axios, navigate} = useContext(AppContext)
  const [roomData, setRoomData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOwnerRooms = async ()=> {
    try {
      const { data } = await axios.get("/api/room/get");
      if (data.success) {
        setRoomData(data.rooms)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
        toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchOwnerRooms()
  }, [])

  const deleteRoom = async(id) => {
    if (!confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { data } = await axios.delete(`/api/room/delete/${id}`)
      if (data.success) {
        toast.success(data.message)
        fetchOwnerRooms()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  }

  const handleRoomUpdate = (updatedRoom) => {
    setRoomData(prevRooms => 
      prevRooms.map(room => 
        room._id === updatedRoom._id ? { ...room, ...updatedRoom } : room
      )
    );
    setIsModalOpen(false);
    setSelectedRoom(null);
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  }

  // Check if discount is currently active
  const isDiscountActive = (room) => {
    if (!room.hasDiscount) return false;
    
    const now = new Date();
    const startDate = room.discountStartDate ? new Date(room.discountStartDate) : null;
    const endDate = room.discountEndDate ? new Date(room.discountEndDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  // Calculate days remaining for discount
  const getDaysRemaining = (room) => {
    if (!isDiscountActive(room) || !room.discountEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(room.discountEndDate);
    const timeDiff = endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#fcae26]/40 to-gray-900 p-6 w-screen'>
      <div className='max-w-7xl mx-auto'>

        {/* Header */}
        <div className='mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 rounded-2xl shadow-2xl p-6'>
          <div>
            <h1 className='text-4xl font-bold text-gray-100 mb-2'>
              All Your Rooms
            </h1>
            <p className='text-gray-300'>
              Manage your rooms here - edit prices, add discounts, and more
            </p>
          </div>
          <motion.button 
            className='bg-[#fcae26] text-white px-6 py-[6px] rounded-md cursor-pointer'
            onClick={() => navigate("/owner/add-room")}
            whileHover={{ scale: 1.05 }}
            transition={{ ease: "easeInOut", duration: 0.3 }} 
          >
            Add New Room
          </motion.button>
        </div>

        {/* Room Table - Desktop */}
        <div className='bg-gray-800 rounded-2xl shadow-2xl overflow-hidden hidden lg:block'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gradient-to-r from-yellow-600 to-orange-600 text-gray-200'>
                <tr>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Room
                  </th>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Hotel
                  </th>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Location
                  </th>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Rating
                  </th>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Price/Night
                  </th>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='py-4 px-6 text-left text-sm font-semibold uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-400'>
                {roomData.map((room, index) => {
                  const discountActive = isDiscountActive(room);
                  const daysRemaining = getDaysRemaining(room);
                  const currentPrice = discountActive ? room.discountedPrice : room.pricePerNight;
                  
                  return (
                    <tr 
                      key={room._id}
                      className={`hover:bg-yellow-600/30 transition-all duration-200
                      ${index % 2 === 0 ? "bg-gray-900" :"bg-gray-950"}`}
                    >
                      <td className='p-6'>
                        <div className='flex items-center space-x-4'>
                          <div className='relative'>
                            <img src={getImageSrc(room.images[0])} alt={room.roomType} className='w-20 h-16 rounded-xl object-cover shadow-md' />
                            <div className='absolute inset-0 bg-gradient-to-t from-black-20 to-transparent rounded-xl'></div>
                            {discountActive && (
                              <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                                {room.discountPercentage}%
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className='text-lg font-semibold text-gray-200 hover:text-yellow-600 transition-colors'>{room.roomType}</h3>
                            {discountActive && (
                              <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                                <Tag className="w-3 h-3" />
                                <span>{room.discountTitle || "Limited Offer"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className='flex items-start space-x-2'>
                          <span className='text-gray-300 text-md leading-relaxed'>{room.hotel.hotelName}</span>
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className='flex items-start space-x-2'>
                          <MapPin className='w-4 h-4 text-gray-400 mt-1 flex-shrink-0'/>
                          <span className='text-gray-300 text-sm leading-relaxed'>{room.hotel.hotelAddress}</span>
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className='flex items-start space-x-2'>
                          <Star className='w-4 h-4 text-amber-400 mt-[2px] fill-current'/>
                          <span className='text-gray-300 text-sm leading-relaxed'>{room.hotel.rating}</span>
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className="flex flex-col">
                          {discountActive ? (
                            <>
                              <span className='text-gray-500 text-sm line-through'>₦{Number(room.pricePerNight).toLocaleString('en-NG')}</span>
                              <span className='text-green-600 text-xl font-bold'>₦{Number(currentPrice).toLocaleString('en-NG')}</span>
                              <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{daysRemaining === 1 ? "Last day!" : `${daysRemaining} days left`}</span>
                              </div>
                            </>
                          ) : (
                            <span className='text-green-600 text-xl font-bold'>₦{Number(room.pricePerNight).toLocaleString('en-NG')}</span>
                          )}
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            room.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {room.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          {discountActive && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              On Sale
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='p-6'>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditRoom(room)}
                            className='bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md cursor-pointer flex items-center gap-1 text-sm transition-colors'
                          >
                            <Edit2 className='w-4 h-4'/>
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteRoom(room._id)} 
                            className='bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded-md cursor-pointer flex items-center gap-1 text-sm transition-colors'
                          >
                            <Trash2 className='w-4 h-4'/>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className='block lg:hidden space-y-6'>
          {roomData.map((room, index) => {
            const discountActive = isDiscountActive(room);
            const daysRemaining = getDaysRemaining(room);
            const currentPrice = discountActive ? room.discountedPrice : room.pricePerNight;
            
            return (
              <div key={room._id} className='bg-gray-800 rounded-xl shadow-xl p-4 relative'>
                {/* Discount Badge for Mobile */}
                {discountActive && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {room.discountPercentage}% OFF
                  </div>
                )}
                
                <img src={getImageSrc(room.images[0])} alt={room.roomType} className='w-full h-48 rounded-xl object-cover mb-4' />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className='text-xl font-bold text-gray-100 mb-2'>{room.roomType}</h3>
                    {discountActive && (
                      <div className="flex items-center gap-1 text-sm text-green-400 mb-2">
                        <Tag className="w-4 h-4" />
                        <span>{room.discountTitle || "Limited Offer"}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.isAvailable 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {room.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
                
                <p className='text-gray-300 text-sm mb-1'><strong>Hotel:</strong> {room.hotel.hotelName}</p>
                <p className='text-gray-300 text-sm mb-1 flex items-center'><MapPin className='w-4 h-4 mr-1' /> {room.hotel.hotelAddress}</p>
                <p className='text-gray-300 text-sm mb-3 flex items-center'><Star className='w-4 h-4 text-amber-400 mr-1 fill-current' /> {room.hotel.rating}</p>
                
                {/* Price Display */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    {discountActive ? (
                      <div className="flex flex-col">
                        <span className='text-gray-500 text-sm line-through'>₦{Number(room.pricePerNight).toLocaleString('en-NG')}</span>
                        <span className='text-green-500 text-lg font-bold'>₦{Number(currentPrice).toLocaleString('en-NG')}</span>
                        <div className="flex items-center gap-1 text-xs text-red-500">
                          <Clock className="w-3 h-3" />
                          <span>{daysRemaining === 1 ? "Last day!" : `${daysRemaining} days left`}</span>
                        </div>
                      </div>
                    ) : (
                      <span className='text-green-500 text-lg font-bold'>₦{Number(room.pricePerNight).toLocaleString('en-NG')}</span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditRoom(room)}
                    className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 flex-1 transition-colors'
                  >
                    <Edit2 className='w-4 h-4' /> Edit Room
                  </button>
                  <button 
                    onClick={() => deleteRoom(room._id)}  
                    className='bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md flex items-center justify-center gap-2 flex-1 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Room Management Modal */}
        {selectedRoom && (
          <RoomManagementModal
            room={selectedRoom}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onUpdate={handleRoomUpdate}
          />
        )}
      </div>
    </div>
  )
}

export default AllRooms;