import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import RoomCard from './RoomCard'

const PopularRooms = () => {
    const { roomPageData } = useContext(AppContext)
  return (
    <div className='py-13'>
         <h1 className='text-[#fcae26] text-3xl font-semibold text-center mx-auto'>
            Popular Rooms
        </h1>
        <p className='text-gray-300 text-sm text-center max-w-lg mx-auto mt-2'>
            Explore our top-rated rooms, loved by our guests for their comfort and view.
        </p>

        <div className='flex flex-wrap items-center justify-center gap-4 max-w-7xl mx-auto mt-12 '>
            {
                roomPageData.slice(0, 3).map(( room) => (
                    <RoomCard key={room._id} room={room} />
                ))
            }
        </div>
    </div>
  )
}

export default PopularRooms