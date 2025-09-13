import React from 'react'
import Hero from '../components/Hero'
import MostPicked from '../components/MostPicked'
import PopularRooms from '../components/PopularRooms'
import Testimonials from '../components/Testimonials'
import Newsletter from '../components/Newsletter'

const Home = () => {
  return (
    <div className='py-24 bg-gray-900'>
      <Hero/>
      <MostPicked/>
      <PopularRooms/>
      <Testimonials/>
      <Newsletter/>
      
    </div>
  )
}

export default Home