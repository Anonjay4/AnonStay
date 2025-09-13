import React, { useContext } from 'react'
import { motion } from 'motion/react'
import { AppContext } from '../context/AppContext'
import { Tag, Clock } from 'lucide-react'

const RoomCard = ({ room }) => {
    const { navigate, isRoomDiscountActive, getCurrentRoomPrice, getDaysRemaining } = useContext(AppContext)
    const discountActive = room.isDiscountCurrentlyActive ?? isRoomDiscountActive(room);
    const currentPrice = room.currentEffectivePrice ?? getCurrentRoomPrice(room);
    const daysRemaining = room.daysRemaining ?? getDaysRemaining(room);

    return (
        <motion.div whileHover={{scale:1.05}} transition={{duration:0.3,ease:"easeInOut"}}>
            <div className='cursor-pointer rounded-xl shadow-xl overflow-hidden transition-transform duration-150 ease-out max-w-80 md:max-w-96 bg-[#fcae26] px-3 md:px-2 py-3 relative'>
                {/* Discount Badge */}
                {discountActive && (
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {room.discountPercentage}% OFF
                    </div>
                )}
                
                <img 
                    src={`http://localhost:4000/images/${room.images[0]}`} 
                    alt={room.roomType} 
                    className='h-60 w-96 object-cover rounded-lg' 
                />
                
                <h3 className='mt-2 px-4 pt-3 mb-1 text-lg font-semibold text-gray-800'>
                    {room.roomType}
                </h3>
                
                <div className='flex items-center gap-4 justify-between px-4'>
                    <div className="flex flex-col">
                        {/* Discount Info */}
                        {discountActive && (
                            <div className="mb-1">
                                <div className="flex items-center gap-2 text-xs text-gray-700 mb-1">
                                    <Clock className="w-3 h-3" />
                                    <span className="font-medium">
                                        {room.discountTitle || "Limited Time Offer"}
                                    </span>
                                </div>
                                {daysRemaining > 0 && (
                                    <div className="text-xs text-red-700 font-medium">
                                        {daysRemaining === 1 
                                            ? "Last day!" 
                                            : `${daysRemaining} days left!`
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {/* Price Display */}
                        <div className="flex items-center gap-2">
                            {discountActive ? (
                                <>
                                    <span className='text-sm text-gray-600 line-through'>
                                        ₦{Number(room.pricePerNight).toLocaleString('en-NG')}
                                    </span>
                                    <span className='text-lg font-bold text-gray-800'>
                                        ₦{Number(currentPrice).toLocaleString('en-NG')}
                                    </span>
                                </>
                            ) : (
                                <span className='text-sm text-gray-800'>
                                    ₦{Number(room.pricePerNight).toLocaleString('en-NG')}
                                </span>
                            )}
                            <span className="text-xs text-gray-700">/Per night</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => { 
                            navigate(`/room/${room._id}`);
                            window.scrollTo({top:0,behavior:"smooth"});
                        }} 
                        className={`rounded-md py-1 px-3 cursor-pointer text-gray-100 transition-colors ${
                            discountActive 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                    >
                        {discountActive ? 'Get Deal' : 'See Details'}
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default RoomCard