import React from 'react'
import {motion} from "motion/react"
import { assets, cities, homePageData } from '../assets/assets'

const Hero = () => {
  return (
    <>
        <main className=" flex flex-col md:flex-row items-center max-md:text-center justify-between pb-16 px-4 sm:px-5 md:px-16 max-w-7xl mx-auto w-full">
            {/* first div */}
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:2}} className='flex flex-col items-center md:items-start'>
                <h1 className='text-[#fcae26] font-bold text-3xl sm:text-4xl md:text-5xl max-w-2xl leading-tight'>
                    Forget Your Busy Work, <br /> Start Your Next Vacation
                </h1>
                <p className='text-gray-300 mt-4 max-w-lg text-sm sm:text-base leading-relaxed  '>
                    We provide what you need to enjoy holidays with your family & friends. Time to make some more memorable moments with them.
                </p>
                <div className='flex flex-col md:flex-row items-center mt-8 gap-3'>
                    <motion.button whileHover={{scale:1.2}} transition={{duration:0.5, ease:"easeInOut"}} className='bg-[#fcae26] text-gray-100 rounded-md px-6 py-2.5 text-sm font-medium flex items-center cursor-pointer'>
                        Show More
                    </motion.button>
                </div>
                <div className=" flex items-center sm:justify-between gap-8 mt-8">
                    {homePageData.map(( item, index ) => (
                        <motion.div key={index} animate={{ y: [ 0, 20, 0 ] }} transition={{duration:3,repeat:Infinity,ease:"easeInOut"}} className='flex items-center flex-col'>
                            <img src={item.icon} alt="" className='w-6 h-6' />
                            <div className='flex items-center gap-1 mt-4'>
                                <p className='text-gray-300'>{item.value}</p>
                                <p className='text-gray-300'>{item.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
            {/* second div */}
            <motion.div className='sm: mt-20' initial={{scale:0}} animate={{scale:[1,1.1,1],}} transition={{duration:3,repeat:Infinity}}>
                <img src={assets.hero_img} alt="" />
            </motion.div>
        </main>
        {/* Form for searching a hotel */}
        <form className= ' max-w-4xl w-fit mx-auto bg-[#EAF1FF] text-gray-800 rounded-2xl px-16 py-4 flex flex-col md:flex-row max-md:items-start gap-4 max-md:mx-auto'>
            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calendar_icon} alt="" className='w-4 h-4'/>
                    <label htmlFor="destinationInput">Select Location</label>
                </div>
                <input list='destinations' id="destinationInput" type="text" className=" rounded border border-gray-900 px-3 py-1.5 mt-1.5 text-sm outline-none" placeholder="Type here" required />
                <datalist id='destinations'>
                    {
                        cities.map(( city, index ) =>(
                            <option key={index} value={city} />
                        ))
                    }
                </datalist>
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calendar_icon} alt="" className='w-4 h-4'/>
                    <label htmlFor="checkIn">Check in</label>
                </div>
                <input id="checkIn" type="date" className=" rounded border border-gray-900 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div>
                <div className='flex items-center gap-2'>
                    <img src={assets.calendar_icon} alt="" className='w-4 h-4'/>
                    <label htmlFor="checkOut">Check out</label>
                </div>
                <input id="checkOut" type="date" className=" rounded border border-gray-900 px-3 py-1.5 mt-1.5 text-sm outline-none" />
            </div>

            <div className='flex md:flex-col max-md:gap-2 max-md:items-center'>
                <label htmlFor="guests">Rooms</label>
                <input min={1} max={4} id="guests" type="number" className=" rounded border border-gray-900 px-3 py-1.5 mt-1.5 text-sm outline-none  max-w-16" placeholder="0" />
            </div>

            <button className='mt-2 flex items-center justify-center gap-1 rounded-md bg-[#fcae26] py-3 px-4 text-white my-auto cursor-pointer max-md:w-full max-md:py-1' >
                <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" >
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                </svg>
                <span>Search</span>
            </button>
        </form>
    </>
  )
}

export default Hero