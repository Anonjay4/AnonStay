import React, { useContext, useEffect, useState } from 'react'
import { User, Mail, Phone, Calendar, Star, Gift, MapPin, CreditCard, CheckCircle, Clock, XCircle, Edit3, Save, X } from "lucide-react"
import { AppContext } from '../context/AppContext.jsx'
import { toast } from 'react-hot-toast'
import { getImageSrc } from '../utils/image'

const UserProfile = () => {
  const { axios, navigate } = useContext(AppContext)
  
  const [userData, setUserData] = useState(null)
  const [bookingData, setBookingData] = useState([])
  const [loyaltyStats, setLoyaltyStats] = useState({
    points: 0,
    totalBookings: 0,
    totalSpent: 0,
    tier: 'Bronze'
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [loading, setLoading] = useState(true)

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get("/api/user/is-auth")
      if (data.success) {
        setUserData(data.user)
        setEditForm({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone || ''
        })
        setLoyaltyStats(prev => ({
          ...prev,
          points: data.user.loyaltyPoints || 0
        }))
      }
    } catch (error) {
      toast.error("Failed to load profile")
    }
  }

  // Fetch user bookings and calculate loyalty points
const fetchUserBookings = async () => {
  try {
    const { data } = await axios.get("/api/bookings/user")
    if (data.success) {
      setBookingData(data.bookings)

      const confirmedBookings = data.bookings.filter(
        booking => booking.status === 'confirmed' || booking.status === 'checked-in'
      )

      const totalSpent = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
      const totalBookings = confirmedBookings.length

      // ✅ keep totalSpent and tier calculation, but don't overwrite points
      setLoyaltyStats(prev => ({
        ...prev,
        totalBookings,
        totalSpent,
        tier: getTierFromPoints(prev.points) // helper below
      }))
    }
  } catch (error) {
    console.log("Booking fetch error:", error)
  }
}

  // Calculate loyalty points and stats
  // const calculateLoyaltyStats = (bookings) => {
  //   const confirmedBookings = bookings.filter(booking => 
  //     booking.status === 'confirmed' || booking.status === 'checked-in'
  //   )
    
  //   const totalSpent = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
  //   const points = confirmedBookings.length // 1 point per confirmed booking
    
  //   let tier = 'Bronze'
  //   if (points >= 20) tier = 'Platinum'
  //   else if (points >= 10) tier = 'Gold'
  //   else if (points >= 5) tier = 'Silver'

  //   setLoyaltyStats({
  //     points,
  //     totalBookings: confirmedBookings.length,
  //     totalSpent,
  //     tier
  //   })
  // }

  // Handle profile update
  const handleProfileUpdate = async () => {
    try {
      const { data } = await axios.put("/api/user/update-profile", editForm)
      if (data.success) {
        setUserData(prev => ({ ...prev, ...editForm }))
        setIsEditing(false)
        toast.success("Profile updated successfully")
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([fetchUserProfile(), fetchUserBookings()])
      setLoading(false)
    }
    fetchData()
  }, [])

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-600 bg-purple-100'
      case 'Gold': return 'text-yellow-600 bg-yellow-100'
      case 'Silver': return 'text-gray-700 bg-gray-100'
      default: return 'text-amber-600 bg-amber-100'
    }
  }
  const getTierFromPoints = (points) => {
  if (points >= 20) return 'Platinum'
  if (points >= 10) return 'Gold'
  if (points >= 5) return 'Silver'
  return 'Bronze'
}
  const getPointsToNextTier = () => {
    const { points } = loyaltyStats
    if (points < 5) return { needed: 5 - points, next: 'Silver' }
    if (points < 10) return { needed: 10 - points, next: 'Gold' }
    if (points < 20) return { needed: 20 - points, next: 'Platinum' }
    return { needed: 0, next: 'Platinum' }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-green-500"
      case "pending": return "text-yellow-500"
      case "cancelled": return "text-red-500"
      case "checked-in": return "text-blue-500"
      default: return "text-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed": return CheckCircle
      case "pending": return Clock
      case "cancelled": return XCircle
      case "checked-in": return CheckCircle
      default: return Clock
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-[#fcae26] text-xl">Loading...</div>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load profile</div>
      </div>
    )
  }

  const nextTierInfo = getPointsToNextTier()

  return (
    <div className='min-h-screen bg-gray-950 py-32'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-[#fcae26] mb-4 text-4xl font-bold'>My Profile</h1>
          <p className='text-gray-300 text-lg'>Manage your account and track your loyalty rewards</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Profile Information */}
          <div className='lg:col-span-1'>
            <div className='bg-gray-900 border border-gray-400 rounded-2xl p-6 mb-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-gray-200'>Profile Information</h2>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className='p-2 text-[#fcae26] hover:bg-gray-700 rounded-lg transition-colors cursor-pointer'
                  >
                    <Edit3 className='w-5 h-5' />
                  </button>
                ) : (
                  <div className='flex gap-2'>
                    <button 
                      onClick={handleProfileUpdate}
                      className='p-2 text-green-400 hover:bg-gray-700 rounded-lg transition-colors'
                    >
                      <Save className='w-5 h-5' />
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className='p-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors'
                    >
                      <X className='w-5 h-5' />
                    </button>
                  </div>
                )}
              </div>

              <div className='space-y-4'>
                <div className='flex items-center gap-3'>
                  <User className='w-5 h-5 text-gray-400' />
                  {isEditing ? (
                    <input 
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white'
                    />
                  ) : (
                    <span className='text-gray-200'>{userData.name}</span>
                  )}
                </div>

                <div className='flex items-center gap-3'>
                  <Mail className='w-5 h-5 text-gray-400' />
                  {isEditing ? (
                    <input 
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white'
                    />
                  ) : (
                    <span className='text-gray-200'>{userData.email}</span>
                  )}
                </div>

                <div className='flex items-center gap-3'>
                  <Phone className='w-5 h-5 text-gray-400' />
                  {isEditing ? (
                    <input 
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      placeholder="+234XXXXXXXXXX"
                      className='flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white'
                    />
                  ) : (
                    <span className='text-gray-200'>{userData.phone || 'Not provided'}</span>
                  )}
                </div>

                <div className='flex items-center gap-3'>
                  <Calendar className='w-5 h-5 text-gray-400' />
                  <span className='text-gray-200'>
                    Member since {new Date(userData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Loyalty Points Card */}
            <div className='bg-gray-900 border border-gray-400 rounded-2xl p-6'>
              <h2 className='text-xl font-bold text-gray-200 mb-4 flex items-center gap-2'>
                <Star className='w-5 h-5 text-[#fcae26]' />
                Loyalty Rewards
              </h2>

              <div className='text-center mb-6'>
                <div className='text-4xl font-bold text-[#fcae26] mb-2'>
                  {loyaltyStats.points}
                </div>
                <div className='text-gray-400'>Loyalty Points</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getTierColor(loyaltyStats.tier)}`}>
                  {loyaltyStats.tier} Member
                </div>
              </div>

              {nextTierInfo.needed > 0 && (
                <div className='mb-4'>
                  <div className='text-sm text-gray-400 mb-2'>
                    {nextTierInfo.needed} more bookings to reach {nextTierInfo.next}
                  </div>
                  <div className='w-full bg-gray-700 rounded-full h-2'>
                    <div 
                      className='bg-[#fcae26] h-2 rounded-full transition-all duration-300'
                      style={{ 
                        width: `${((loyaltyStats.points % (loyaltyStats.points < 5 ? 5 : loyaltyStats.points < 10 ? 10 : 20)) / (loyaltyStats.points < 5 ? 5 : loyaltyStats.points < 10 ? 10 : 20)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className='grid grid-cols-2 gap-4 text-center'>
                <div>
                  <div className='text-lg font-semibold text-gray-200'>
                    {loyaltyStats.totalBookings}
                  </div>
                  <div className='text-sm text-gray-400'>Total Bookings</div>
                </div>
                <div>
                  <div className='text-lg font-semibold text-gray-200'>
                    ₦{loyaltyStats.totalSpent.toLocaleString('en-NG')}
                  </div>
                  <div className='text-sm text-gray-400'>Total Spent</div>
                </div>
              </div>

              {loyaltyStats.points >= 5 && (
                <div className='mt-4 p-3 bg-green-900/50 border border-green-600 rounded-lg'>
                  <div className='flex items-center gap-2 text-green-400 text-sm'>
                    <Gift className='w-4 h-4' />
                    You can use 5 points for a discount on your next booking!
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className='lg:col-span-2'>
            <div className='bg-gray-900 border border-gray-400 rounded-2xl overflow-hidden'>
              <div className='flex justify-between items-center p-6 border-b border-gray-700'>
                <h2 className='text-xl font-bold text-gray-200'>Recent Bookings</h2>
                <button 
                  onClick={() => navigate('/my-bookings')}
                  className='text-[#fcae26] hover:underline text-sm cursor-pointer'
                >
                  View All
                </button>
              </div>

              <div className='divide-y divide-gray-700'>
                {bookingData.slice(0, 5).map((booking) => {
                  const StatusIcon = getStatusIcon(booking.status)
                  return (
                    <div key={booking._id} className='p-6 hover:bg-gray-800/50 transition-colors'>
                      <div className='flex gap-4'>
                        <img
                          src={getImageSrc(booking.room.images[0])}
                          alt={booking.room.roomType}
                          className='w-16 h-16 rounded-lg object-cover'
                        />
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-gray-200 text-lg mb-1'>
                            {booking.hotel.hotelName}
                          </h3>
                          <p className='text-[#fcae26] font-medium mb-1'>
                            {booking.room.roomType}
                          </p>
                          <div className='flex items-center gap-4 text-sm text-gray-400'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='w-3 h-3' />
                              {new Date(booking.checkIn).toLocaleDateString()}
                            </div>
                            <div className='flex items-center gap-1'>
                              <StatusIcon className={`w-4 h-4 ${getStatusColor(booking.status)}`} />
                              <span className={`capitalize ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-lg font-semibold text-gray-200'>
                            ₦{booking.totalPrice.toLocaleString('en-NG')}
                          </div>
                          {(booking.status === 'confirmed' || booking.status === 'checked-in') && (
                            <div className='text-sm text-green-400'>+1 Point</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {bookingData.length === 0 && (
                  <div className='p-12 text-center'>
                    <div className='text-gray-400 mb-4'>No bookings yet</div>
                    <button 
                      onClick={() => navigate('/hotels')}
                      className='bg-[#fcae26] text-white px-6 py-2 rounded-lg hover:bg-[#e09b1f] transition-colors'
                    >
                      Book Your First Hotel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile