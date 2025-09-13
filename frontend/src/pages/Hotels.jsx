import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import { MapPin } from 'lucide-react';

const Hotels = () => {
  const { hotelData, navigate } = useContext(AppContext)

  const handleHotelClick = (hotelId, hotelName) => {
    // Navigate to hotel-specific rooms page
    navigate(`/hotel/${hotelId}/rooms`, { 
      state: { hotelName } 
    })
    scrollTo(0, 0);
  }

  return (
    <div className='py-24 max-7xl mx-auto bg-gray-900'>
      <h1 className='text-5xl font-semibold text-[#fcae26] my-8 px-2 text-center'>
        All Hotels
      </h1>

      <div className='flex flex-wrap items-center justify-center mt-12 gap-4 max-w-5xl mx-auto'>
        {
          hotelData.map((item, index) => (
            <div 
              key={index} 
              className='relative group rounded-lg overflow-hidden cursor-pointer transform transition-transform hover:scale-105'
              onClick={() => handleHotelClick(item._id, item.hotelName)}
            >
              <img 
                src={`http://localhost:4000/images/${item.image}`} 
                alt={item.hotelName} 
                className='h-64 w-80 object-cover object-top'
              />
              <div className='absolute inset-0 flex flex-col justify-end p-4 text-white opacity-0 md:opacity-0 group-hover:opacity-100 group-hover:bg-[#fcae26]/60 transition-all duration-300'>
                <h1 className='text-lg font-medium'>{item.hotelName}</h1>
                <p className='text-sm flex'>
                  <MapPin className='h-6 w-6 mr-2'/>
                  {item.hotelAddress}
                </p>
                <div className='mt-2 text-sm bg-white/20 rounded px-2 py-1 inline-block'>
                  Click to view rooms
                </div>
              </div>
              
              {/* Always visible hotel name for mobile */}
              <div className='md:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
                <h1 className='text-white text-lg font-medium'>{item.hotelName}</h1>
                <p className='text-white/80 text-sm flex items-center'>
                  <MapPin className='h-4 w-4 mr-1'/>
                  {item.hotelAddress}
                </p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Hotels