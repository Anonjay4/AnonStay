import React, { useContext } from 'react'
import { AppContext } from '../context/AppContext'
import RoomCard from '../components/RoomCard'

const Rooms = () => {
  const {roomData} = useContext(AppContext)
  return (
    <main className='bg-gray-900'>
      <div className='py-24 max-w-7xl mx-auto bg-gray-900'>
        <h1 className='text-5xl font-semibold text-[#fcae26] my-8 px-2 text-center'>
          All Rooms
        </h1>

        <div className='flex flex-wrap items-center justify-center gap-4 max-w-7xl mx-auto mt-12 '>
            {
                roomData.map(( room) => (
                    <RoomCard key={room._id} room={room} />
                ))
            }
        </div>
      </div>
    </main>
  )
}

export default Rooms