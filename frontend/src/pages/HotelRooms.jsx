import React, { useContext, useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { MapPin, Star, ArrowLeft } from 'lucide-react'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-hot-toast'
import RoomCard from '../components/RoomCard'

const HotelRooms = () => {
  const { hotelId } = useParams()
  const location = useLocation()
  const hotelName = location.state?.hotelName || 'Hotel'
  
  const { axios, navigate } = useContext(AppContext)
  const [rooms, setRooms] = useState([])
  const [hotelData, setHotelData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchHotelRooms = async () => {
    try {
      const { data } = await axios.get(`/api/room/hotel/${hotelId}`)
      if (data.success) {
        setRooms(data.rooms)
        if (data.rooms.length > 0) {
          setHotelData(data.rooms[0].hotel)
        }
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Error fetching hotel rooms')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotelRooms()
  }, [hotelId])

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='text-[#fcae26] text-xl'>Loading hotel rooms...</div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-900 py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Back Button */}
        <button
          onClick={() => navigate('/hotels')}
          className='flex items-center gap-2 text-[#fcae26] hover:text-yellow-400 mb-6 transition-colors'
        >
          <ArrowLeft className='w-5 h-5' />
          Back to All Hotels
        </button>

        {/* Hotel Header */}
        {hotelData && (
          <div className='bg-gray-800 rounded-lg p-6 mb-8'>
            <div className='flex flex-col md:flex-row gap-6'>
              <img
                src={`http://localhost:4000/images/${hotelData.image}`}
                alt={hotelData.hotelName}
                className='w-full md:w-64 h-48 object-cover rounded-lg'
              />
              <div className='flex-1'>
                <h1 className='text-3xl font-bold text-[#fcae26] mb-2'>
                  {hotelData.hotelName}
                </h1>
                <div className='flex items-center gap-2 text-gray-300 mb-4'>
                  <MapPin className='w-5 h-5' />
                  <span>{hotelData.hotelAddress}</span>
                </div>
                <div className='flex items-center gap-2 mb-4'>
                  <Star className='w-5 h-5 text-yellow-400 fill-current' />
                  <span className='text-gray-300'>{hotelData.rating} Star Hotel</span>
                </div>
                {hotelData.amenities && hotelData.amenities.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {hotelData.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className='px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm'
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rooms Section */}
        <div className='mb-8'>
          <h2 className='text-4xl font-semibold text-[#fcae26] mb-6 text-center'>
            Available Rooms ({rooms.length})
          </h2>

          {rooms.length === 0 ? (
            <div className='text-center py-12'>
              <div className='text-gray-400 text-lg mb-4'>
                No rooms available at this hotel
              </div>
              <button
                onClick={goBack}
                className='px-6 py-3 bg-[#fcae26] text-gray-900 font-medium rounded-lg hover:bg-yellow-400 transition-colors'
              >
                Browse Other Hotels
              </button>
            </div>
          ) : (
            <div className='flex flex-wrap items-center justify-center gap-4 max-w-7xl mx-auto mt-12'>
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HotelRooms