import React, { useContext, useState, useEffect } from 'react'
import { useParams } from "react-router-dom"
import { AppContext } from '../context/AppContext'
import { Bath, Building, Car, Coffee, Eye, Mountain, TreePine, Tv, User, Utensils, Wifi, MapPin, Star, CheckCircle, XCircle, Phone, WavesLadder, UtensilsCrossed, Bubbles, MartiniIcon, Wine, Volleyball, BrickWallFire, CableCar, Dumbbell, BriefcaseBusiness, EggFried, Rose, Binoculars, Calendar, HousePlus, Gift, Info, Tag, Clock, AlertCircle } from "lucide-react"
import {toast} from 'react-hot-toast'

const SingularRoom = () => {
  const { roomData, axios, navigate, user } = useContext(AppContext)
  const { id } = useParams()
  const room = roomData.find(( r ) => r._id === id )
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    persons: 1,
    paymentMethod: "Pay At Hotel"
  })
  const [isAvailable, setIsAvailable] = useState(false)
  const [userLoyaltyPoints, setUserLoyaltyPoints] = useState(0)
  const [useLoyaltyDiscount, setUseLoyaltyDiscount] = useState(false)
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(5)
  const [loyaltyDiscountPercentage, setLoyaltyDiscountPercentage] = useState(0)
  const [originalPrice, setOriginalPrice] = useState(0)
  const [finalPrice, setFinalPrice] = useState(0)
  const [nights, setNights] = useState(0)
  const [loading, setLoading] = useState(false)

  // Check if room discount is currently active
  const isRoomDiscountActive = () => {
    if (!room?.hasDiscount) return false;
    
    const now = new Date();
    const startDate = room.discountStartDate ? new Date(room.discountStartDate) : null;
    const endDate = room.discountEndDate ? new Date(room.discountEndDate) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  // Get current effective room price (with room discount applied)
  const getCurrentRoomPrice = () => {
    return isRoomDiscountActive() ? room.discountedPrice : room.pricePerNight;
  };

  // Calculate days remaining for room discount
  const getDaysRemaining = () => {
    if (!isRoomDiscountActive() || !room?.discountEndDate) return 0;
    
    const now = new Date();
    const endDate = new Date(room.discountEndDate);
    const timeDiff = endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Fetch user's loyalty points
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get("/api/user/is-auth")
        if (data.success && data.user) {
          setUserLoyaltyPoints(data.user.loyaltyPoints || 0)
        }
      } catch (error) {
        console.log("Error fetching user data:", error)
      }
    }
    
    if (user) {
      fetchUserData()
    }
  }, [user, axios])

  // Calculate price whenever booking data changes
  useEffect(() => {
    if (bookingData.checkIn && bookingData.checkOut && room) {
      const checkIn = new Date(bookingData.checkIn)
      const checkOut = new Date(bookingData.checkOut)
      const timeDiff = checkOut.getTime() - checkIn.getTime()
      const calculatedNights = Math.ceil(timeDiff / (1000 * 3600 * 24))
      
      if (calculatedNights > 0) {
        setNights(calculatedNights)
        
        // Use current room price (which includes room discount if active)
        const currentRoomPrice = getCurrentRoomPrice()
        const basePrice = currentRoomPrice * calculatedNights * bookingData.persons
        setOriginalPrice(basePrice)
        
        // Calculate additional loyalty discount if using loyalty points
        if (useLoyaltyDiscount && loyaltyPointsToUse >= 5) {
          const loyaltyDiscount = Math.min(loyaltyPointsToUse * 1, 50) // 1% per point, max 50%
          setLoyaltyDiscountPercentage(loyaltyDiscount)
          setFinalPrice(basePrice * (1 - loyaltyDiscount / 100))
        } else {
          setLoyaltyDiscountPercentage(0)
          setFinalPrice(basePrice)
        }
      }
    }
  }, [bookingData, room, useLoyaltyDiscount, loyaltyPointsToUse])

  const onChangeHandler = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value })
  }

  const handleLoyaltyToggle = (checked) => {
    setUseLoyaltyDiscount(checked)
    if (!checked) {
      setLoyaltyPointsToUse(5)
      setLoyaltyDiscountPercentage(0)
    }
  }

  const handleLoyaltyPointsChange = (value) => {
    const points = parseInt(value)
    if (points >= 5 && points <= Math.min(userLoyaltyPoints, 50)) {
      setLoyaltyPointsToUse(points)
    }
  }

  useEffect(() => {
    let toastId;
    if (!room) {
      toastId = toast.loading("Loading room details");
    } else {
      toast.dismiss();
    }
    return () => {
      if (toastId) toast.dismiss(toastId);
    };
  }, [room]);

  if (!room) {
    return null;
  }

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      "Ocean View": Eye,
      "Mountain View": Mountain,
      "City View" : Eye,
      "Garden View" : TreePine,
      Balcony: Building,
      "Mini Bar": Coffee,
      "Room Service": Utensils,
      "WiFi": Wifi,
      "Premium Wifi": Wifi,
      "Free WiFi": Wifi,
      "Work Desk": Building,
      "Concierge": User,
      "Concierge Service": User,
      "Breakfast Included": Coffee,
      Parking: Car,
      Valet: Car,
      "Smart TV": Tv,
      "Spa": Bubbles,
      "Spa Access": Bubbles,
      "Pool": Bath,
      "Rooftop Pool": WavesLadder,
      "Pool Access": WavesLadder,
      "Free Breakfast": EggFried,
      Kitchen: Utensils,
      Restaurant: UtensilsCrossed,
      Bar: Wine,
      "Living Area": Building,
      "Private Terrace": Building,
      "Butler Service": User,
      Jacuzzi: Bath,
      "Panoramic View": Eye,
      "Beach Access": Volleyball,
      Fireplace: BrickWallFire,
      Gym: Dumbbell,
      "Ski Access": CableCar,
      "Business Center": BriefcaseBusiness,
      Garden: Rose,
      "Historic Tours": Binoculars
    }
    return iconMap[amenity] || CheckCircle;
  }

  const normalizeAmenities = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    return amenities.split(",");
  };

 const checkRoomAvailability = async () => {
  try {
    if (bookingData.checkIn >= bookingData.checkOut) {
      toast.error("Check-in date must be before check-out date")
      return
    }
    if (bookingData.persons <= 0) {
      toast.error("Number of persons must be greater than 0")
      return
    }
    const { data } = await axios.post("/api/bookings/check-availability", {
      room: room._id,
      checkInDate: bookingData.checkIn,
      checkOutDate: bookingData.checkOut,
    })
    if (data.success) {
      setIsAvailable(data.isAvailable)
      data.isAvailable 
        ? toast.success("Room is available") 
        : toast.error("Room is not available")
    } else {
      toast.error(data.message)
    }
  } catch (error) {
    toast.error(error.message)
  } 
}
  
  const formatPhone = (phone) => {
    if (!phone) return "";
    
    const digits = phone.replace(/\D/g, "");
    
    if (digits.length === 13) {
      return `+${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)} ${digits.substring(9)}`;
    }
    
    return phone;
  };

const onSubmitHandler = async (e) => {
  e.preventDefault()
  
  if (!user) {
    toast.error("Please login to make a booking")
    navigate("/login")
    return
  }

  try {
    if (!isAvailable) {
      return checkRoomAvailability()
    } else {
      if (useLoyaltyDiscount && loyaltyPointsToUse < 5) {
        toast.error("Minimum 5 loyalty points required for discount")
        return
      }

      if (useLoyaltyDiscount && loyaltyPointsToUse > userLoyaltyPoints) {
        toast.error("Insufficient loyalty points")
        return
      }

      const bookingPayload = {
        room: room._id,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        persons: bookingData.persons,
        paymentMethod: bookingData.paymentMethod,
        useLoyaltyDiscount,
        loyaltyPointsUsed: useLoyaltyDiscount ? loyaltyPointsToUse : 0,
        discountPercentage: useLoyaltyDiscount ? loyaltyDiscountPercentage : 0
      }

      const { data } = await axios.post("/api/bookings/book", bookingPayload)
      
      if (data.success) {
        toast.success("Booking created successfully!")

        if (bookingData.paymentMethod === "Pay Online") {
          try {
            const init = await axios.post("/api/bookings/paystack/initialize", {
              bookingId: data.bookingId,
              callbackUrl: window.location.origin
            })
            if (init.data.success) {
              window.location.href = init.data.authorizationUrl
            } else {
              toast.error(init.data.message)
              navigate("/my-bookings")
            }
          } catch (err) {
            toast.error("Failed to initiate payment")
            navigate("/my-bookings")
          }
        } else {
          toast.info("You can make payment at the reception on your check-in date")
          navigate("/my-bookings")
        }
      } else {
        toast.error(data.message)
      }
    }
  } catch (error) {
    toast.error(error.response?.data?.message || error.message)
  }
}

  const maxLoyaltyPoints = Math.min(userLoyaltyPoints, 50)
  const canUseLoyalty = userLoyaltyPoints >= 5
  const roomDiscountActive = isRoomDiscountActive()
  const daysRemaining = getDaysRemaining()
  const currentRoomPrice = getCurrentRoomPrice()

  return (
    <div className='py-24 min-h-screen bg-gray-900'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        {/* Header Section with Discount Banner */}
        <div className='bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 relative overflow-hidden'>
          {/* Discount Banner */}
          {roomDiscountActive && (
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-6">
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Tag className="w-4 h-4" />
                <span>{room.discountTitle || "Limited Time Offer"}</span>
                <span className="bg-white text-red-500 px-2 py-1 rounded text-xs font-bold ml-2">
                  {room.discountPercentage}% OFF
                </span>
                {daysRemaining > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">
                      {daysRemaining === 1 ? "Last day!" : `${daysRemaining} days left!`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 ${roomDiscountActive ? 'mt-8' : ''}`}>
            <div className='flex-1'>
              <h1 className='text-4xl font-bold text-white'>
                {room.roomType}
              </h1>
              <div className='flex items-center gap-2 text-gray-200 mt-2 mb-4'>
                <MapPin className='w-5 h-5'/>
                <span>
                  {room.hotel.hotelAddress}
                </span>
              </div>
              <div className='flex items-center gap-4'>
                <div className='flex items-center gap-1'>
                  <Star className='w-5 h-5 text-yellow-400 fill-current'/>
                  <span className='text-gray-200'>
                    {room.hotel.rating}
                  </span>
                </div>
                <div 
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium 
                  ${room.isAvailable
                  ?"bg-green-300 text-green-700"
                  :"bg-red-300 text-red-600"}`}>
                    {
                      room.isAvailable
                      ?(
                        <>
                        <CheckCircle className='w-4 h-4'/> Available
                        </>
                      )
                      :(
                        <>
                        <XCircle className='w-4 h-4'/> Not Available
                        </>
                      )
                    }
                </div>
              </div>
            </div>
            <div className='text-right'>
              <div className='mb-2'>
                {roomDiscountActive ? (
                  <div className="flex flex-col items-end">
                    <span className='text-lg font-medium text-gray-500 line-through mb-1'>
                      ₦{Number(room.pricePerNight).toLocaleString('en-NG')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className='text-3xl font-bold text-[#fcae26]'>
                        ₦{Number(currentRoomPrice).toLocaleString('en-NG')}
                      </span>
                      <span className='text-gray-300 ml-0.5'>/night</span>
                    </div>
                    <div className="text-green-400 text-sm font-medium">
                      You save ₦{Number(room.pricePerNight - currentRoomPrice).toLocaleString('en-NG')} per night!
                    </div>
                  </div>
                ) : (
                  <>
                    <span className='text-3xl font-bold text-[#fcae26]'>₦{Number(room.pricePerNight).toLocaleString('en-NG')}</span> 
                    <span className='text-gray-300 ml-0.5'>/night</span>
                  </>
                )}
              </div>
            
              <div className='text-gray-300'>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4'/>
                  <span>
                    {room.hotel.owner.name}
                  </span>
                </div>
                <div className='flex items-center gap-2 mt-1'>
                  <Phone className='w-4 h-4'/>
                  <span>
                    {formatPhone(room.hotel.owner.phone)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className='bg-gray-800 rounded-2xl shadow-lg p-8 mb-8'>
          <h2 className='text-3xl font-bold text-white mb-6'>
            Room Gallery
          </h2>
          <div className='grid lg:grid-cols-3 gap-6'>
            <div className='lg:col-span-2'>
              <img src={room.images[selectedImage]}
              alt={`${room.roomType} - Image ${selectedImage + 1}`}
              className='w-full h-96 object-cover rounded-xl'/>
            </div>
              <div className='grid grid-cols-2 lg:grid-cols-1 gap-4'>
              {
                  room.images.map((image, index) => (
                    <img key={index} src={image} alt={`Thumbnail ${index + 1}`}
                      className={`h-24 lg:h-20 object-cover rounded-lg cursor-pointer transition-all duration-200
                        ${
                          selectedImage === index
                          ? "ring-4 ring-[#fcae26] opacity-100"
                          : "opacity-70 hover:opacity-100"
                        }`}
                      onClick={() => setSelectedImage(index)} />
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className='grid lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-8'>
            <div className='bg-gray-800 rounded-2xl shadow-lg p-8'>
              <h2 className='text-2xl font-bold text-white mb-4'>
                About This Room
              </h2>
              <p className='text-gray-300 leading-relaxed'>
                {room.description}
              </p>
            </div>

            {/* Room Amenities */}
            <div className='bg-gray-800 rounded-2xl shadow-lg p-8'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Room Amenities
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {
                  normalizeAmenities(room.amenities).map((amenity,index) => {
                    const IconComponent = getAmenityIcon(amenity.trim());
                    return(
                      <div key={index} className='flex items-center gap-3 p-3 bg-yellow-100 rounded-lg cursor-default' >
                        <IconComponent className='w-5 h-5 text-[#fcae26]' />
                        <span className='text-gray-700 font-medium'>
                          {amenity}
                        </span>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* Hotel Amenities */}
            <div className='bg-gray-800 rounded-2xl shadow-lg p-8'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Hotel Amenities
              </h2>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                {
                  normalizeAmenities(room.hotel.amenities).map((amenity,index) => {
                    const IconComponent = getAmenityIcon(amenity.trim());
                    return(
                      <div key={index} className='flex items-center gap-3 p-3 bg-yellow-100 rounded-lg cursor-default' >
                        <IconComponent className='w-5 h-5 text-[#fcae26]' />
                        <span className='text-gray-700 font-medium'>
                          {amenity}
                        </span>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>

          {/* Enhanced Booking Form */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-800 rounded-2xl shadow-lg p-8 sticky top-8'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Book This Room
              </h2>
              
              {/* Discount Alert */}
              {roomDiscountActive && (
                <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Special Offer Active!</span>
                  </div>
                  <p className="text-red-300 text-sm">
                    {room.discountTitle} - Save {room.discountPercentage}% on your booking!
                    {daysRemaining > 0 && (
                      <span className="block font-medium mt-1">
                        {daysRemaining === 1 ? "Expires tomorrow!" : `${daysRemaining} days remaining.`}
                      </span>
                    )}
                  </p>
                </div>
              )}

              <form onSubmit={onSubmitHandler} className='space-y-4'>
                <div>
                  <label htmlFor="" className='block text-sm font-medium text-gray-100 mb-2'>
                    <Calendar className='h-4 w-4 inline mr-2 text-[#fcae26] mb-1'/>
                    Check-in Date
                  </label>
                  <input 
                    type="date"
                    name = "checkIn"
                    min = {new Date().toISOString().split('T')[0]}
                    value={bookingData.checkIn}
                    onChange={onChangeHandler}
                    className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fcae26] focus:border-transparent text-gray-200 cursor-pointer'
                    required
                  />
                </div>
                <div>
                  <label htmlFor="" className='block text-sm font-medium text-gray-100 mb-2'>
                    <Calendar className='h-4 w-4 inline mr-2 text-[#fcae26] mb-1'/>
                    Check-out Date
                  </label>
                  <input 
                    type="date"
                    name = "checkOut"
                    min = {new Date().toISOString().split('T')[0]}
                    value={bookingData.checkOut}
                    onChange={onChangeHandler}
                    className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fcae26] focus:border-transparent text-gray-200 cursor-pointer'
                    required
                  />
                </div>
                <div>
                  <label htmlFor="" className='block text-sm font-medium text-gray-100 mb-2'>
                    <HousePlus className='h-5 w-5 inline mr-2 text-[#fcae26] mb-1'/>
                    Number of Rooms
                  </label>
                  <input 
                    type="number"
                    value={bookingData.persons}
                    min={1}
                    max={5}
                    name='persons'
                    onChange={onChangeHandler}
                    className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fcae26] focus:border-transparent text-gray-200 cursor-pointer'
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className='block text-sm font-medium text-gray-100 mb-2'>
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={bookingData.paymentMethod}
                    onChange={onChangeHandler}
                    className='w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-[#fcae26] text-gray-200'
                  >
                    <option value="Pay At Hotel">Pay At Hotel</option>
                    <option value="Pay Online">Pay Online</option>
                  </select>
                </div>

                {/* Loyalty Points Section */}
                {user && (
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="w-5 h-5 text-[#fcae26]" />
                      <span className="font-medium text-gray-200">Loyalty Rewards</span>
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-3">
                      You have <span className="font-medium text-[#fcae26]">{userLoyaltyPoints}</span> loyalty points
                    </div>

                    {canUseLoyalty ? (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={useLoyaltyDiscount}
                            onChange={(e) => handleLoyaltyToggle(e.target.checked)}
                            className="w-4 h-4 text-[#fcae26] bg-gray-600 border-gray-500 rounded focus:ring-[#fcae26] focus:ring-2"
                          />
                          <span className="text-sm text-gray-300">Use loyalty points for additional discount</span>
                        </label>

                        {useLoyaltyDiscount && (
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Points to use (5-{maxLoyaltyPoints})
                            </label>
                            <input
                              type="number"
                              min="5"
                              max={maxLoyaltyPoints}
                              value={loyaltyPointsToUse}
                              onChange={(e) => handleLoyaltyPointsChange(e.target.value)}
                              className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]"
                            />
                            <div className="text-xs text-gray-400 mt-1">
                              Additional {loyaltyDiscountPercentage}% discount = ₦{(originalPrice * loyaltyDiscountPercentage / 100).toLocaleString('en-NG')} off
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-start gap-2 text-sm text-gray-400">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>You need at least 5 loyalty points to use this discount feature. Book more hotels to earn points!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Summary */}
                {nights > 0 && (
                  <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                    <h4 className="font-medium text-gray-200 mb-2">Price Summary</h4>
                    <div className="space-y-1 text-sm">
                      {roomDiscountActive && (
                        <div className="flex justify-between text-gray-500 line-through">
                          <span>Original: ₦{room.pricePerNight.toLocaleString('en-NG')} × {nights} night{nights > 1 ? 's' : ''} × {bookingData.persons} room{bookingData.persons > 1 ? 's' : ''}</span>
                          <span>₦{(room.pricePerNight * nights * bookingData.persons).toLocaleString('en-NG')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-300">
                        <span>
                          {roomDiscountActive ? 'Discounted: ' : ''}
                          ₦{currentRoomPrice.toLocaleString('en-NG')} × {nights} night{nights > 1 ? 's' : ''} × {bookingData.persons} room{bookingData.persons > 1 ? 's' : ''}
                        </span>
                        <span>₦{originalPrice.toLocaleString('en-NG')}</span>
                      </div>
                      {roomDiscountActive && (
                        <div className="flex justify-between text-green-400">
                          <span>Room discount ({room.discountPercentage}%)</span>
                          <span>-₦{((room.pricePerNight - currentRoomPrice) * nights * bookingData.persons).toLocaleString('en-NG')}</span>
                        </div>
                      )}
                      {useLoyaltyDiscount && loyaltyDiscountPercentage > 0 && (
                        <div className="flex justify-between text-blue-400">
                          <span>Additional loyalty discount ({loyaltyDiscountPercentage}%)</span>
                          <span>-₦{(originalPrice * loyaltyDiscountPercentage / 100).toLocaleString('en-NG')}</span>
                        </div>
                      )}
                      <hr className="border-gray-600" />
                      <div className="flex justify-between font-medium text-gray-200 text-lg">
                        <span>Total</span>
                        <span>₦{finalPrice.toLocaleString('en-NG')}</span>
                      </div>
                      {(roomDiscountActive || (useLoyaltyDiscount && loyaltyDiscountPercentage > 0)) && (
                        <div className="text-green-400 text-sm font-medium text-right">
                          Total savings: ₦{((room.pricePerNight * nights * bookingData.persons) - finalPrice).toLocaleString('en-NG')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                     roomDiscountActive
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-[#fcae26] hover:bg-[#fcab1f] text-white'
                  }`}
                  type='submit' 
                >
                  {isAvailable ? (roomDiscountActive ? "Book Deal Now" : "Book Now") : "Check Availability"}
                </button>

                {/* Earn Points Info */}
                {user && (
                  <div className="text-center text-sm text-gray-400 mt-2">
                    You'll earn 1 loyalty point when this booking is confirmed!
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

export default SingularRoom
