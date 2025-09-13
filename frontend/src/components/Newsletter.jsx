import React from 'react'

const Newsletter = () => {
  return (
            <div className="flex flex-col items-center justify-center text-center space-y-2">
            <h1 className="md:text-4xl text-2xl font-semibold text-[#fcae26] ">Never Miss a Deal!</h1>
            <p className="md:text-lg text-gray-200/90 pb-8">
                Subscribe to get the latest offers, new hotels & rooms, and exclusive discounts
            </p>
            <form className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
                <input
                    className="border border-gray-300 rounded-md h-full border-r-0 outline-none w-full rounded-r-none px-3 text-gray-300"
                    type="email"
                    placeholder="Enter your email id"
                    required
                />
                <button type="submit" className="md:px-12 px-8 h-full text-white bg-[#fcae26] hover:bg-white hover:text-[#fcae26] transition-all cursor-pointer rounded-md rounded-l-none">
                    Subscribe
                </button>
            </form>
        </div>

  )
}

export default Newsletter