import React, { useContext, useEffect, useState } from 'react'
import { MapPin, Calendar, Users, CreditCard, CheckCircle, Clock, XCircle, Eye, Trash2, HandCoins, HousePlus } from "lucide-react"
import { AppContext } from '../context/AppContext.jsx'
import { toast } from 'react-hot-toast'

const MyBookings = () => {

  const { axios, navigate } = useContext(AppContext)
  
  const [bookingData, setBookingData] = useState([])
  const [cancelling, setCancelling] = useState({})
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [cancellationReason, setCancellationReason] = useState('')

  const fetchMyBookings = async () => {
    try {
      const { data } =await axios.get("/api/bookings/user")
      if (data.success) {
        setBookingData(data.bookings)
      }else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handlePayment = async(bookingId) => {
    try {
      const { data } = await axios.post("/api/bookings/paystack-payment", { bookingId })
      if (data.success) {
        window.location.href = data.url
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return

    // Check if booking can be cancelled (24 hours before check-in)
    const booking = bookingData.find(b => b._id === selectedBookingId)
    if (!booking) return

    const now = new Date()
    const checkInDate = new Date(booking.checkIn)
    const timeDifference = checkInDate.getTime() - now.getTime()
    const hoursDifference = timeDifference / (1000 * 3600)

    if (hoursDifference <= 24) {
      toast.error("Cannot cancel booking within 24 hours of check-in")
      setShowCancelModal(false)
      return
    }
    
    setCancelling(prev => ({ ...prev, [selectedBookingId]: true }))
    
    try {
      const { data } = await axios.put(`/api/bookings/cancel/${selectedBookingId}`, {
        cancellationReason: cancellationReason || "Cancelled by user"
      })
      
      if (data.success) {
        toast.success("Booking cancelled successfully")
        // Update local state
        setBookingData(prev => 
          prev.map(booking => 
            booking._id === selectedBookingId 
              ? { ...booking, status: "cancelled", cancelledAt: new Date() }
              : booking
          )
        )
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking")
    } finally {
      setCancelling(prev => ({ ...prev, [selectedBookingId]: false }))
      setShowCancelModal(false)
      setSelectedBookingId(null)
      setCancellationReason('')
    }
  }

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId)
    setShowCancelModal(true)
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedBookingId(null)
    setCancellationReason('')
  }

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const getStatusColor = (status) => {
    switch ( status ) {
      case"confirmed":
        return "bg-green-500";
      case"pending":
        return "bg-yellow-500";
      case"cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch ( status ) {
      case"confirmed":
        return "text-green-500";
      case"checked-in":
        return "text-green-500";
      case"pending":
        return "text-yellow-500";
      case"cancelled":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return CheckCircle;
      case "checked-in":
        return CheckCircle;
      case "pending":
        return Clock;
      case "cancelled":
        return XCircle;
      default:
        return Clock ;
    }
  };

  const canCancelBooking = (booking) => {
    if (booking.status === "cancelled") return false
    
    const now = new Date()
    const checkInDate = new Date(booking.checkIn)
    const timeDifference = checkInDate.getTime() - now.getTime()
    const hoursDifference = timeDifference / (1000 * 3600)
    
    return hoursDifference > 24
  }

  return (
    <div className='min-h-screen bg-gray-950 py-32'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Header  */}
        <div className='text-center mb-12'>
          <h1 className='text-[#fcae26] mb-4 text-4xl font-bold'>
            My Bookings
          </h1>
          <p className='text-gray-100 text-lg'>
            {" "}
            Here are your hotel bookings. You can view details and manage your reservations here.
          </p>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <div className='bg-gray-900 border border-gray-400 rounded-lg p-6 max-w-md w-full mx-4'>
              <h3 className='text-xl font-bold text-gray-200 mb-4'>Cancel Booking</h3>
              <p className='text-gray-300 mb-4'>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className='mb-4'>
                <label className='block text-sm text-gray-400 mb-2'>
                  Reason for cancellation (optional):
                </label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcae26]'
                  placeholder='Please provide a reason...'
                  rows={3}
                />
              </div>
              <div className='flex gap-4'>
                <button
                  onClick={closeCancelModal}
                  className='flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors cursor-pointer'
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling[selectedBookingId]}
                  className={`flex-1 px-4 py-2 rounded-md transition-colors cursor-pointer ${
                    cancelling[selectedBookingId]
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {cancelling[selectedBookingId] ? 'Cancelling...' : 'Yes, Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings List  */}
        <div className='bg-gray-900 border-1 border-gray-400 rounded-2xl shadow-lg overflow-hidden'>
          {/* Desktop Header  */}
          <div className='hidden md:grid md:grid-cols-12 bg-gray-950 px-10 gap-6 py-4 border-b border-gray-400 font-semibold text-gray-200'>
            <div className='col-span-4'>Hotel & Room</div>
            <div className='col-span-2'>Dates</div>
            <div className='col-span-2'>Payment</div>
            <div className='col-span-1'>Status</div>
            <div className='col-span-3 justify-center flex'>Actions</div>
          </div>
              <div className='divide-y divide-gray-700 hidden md:grid'>
              {bookingData.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                const canCancel = canCancelBooking(booking);
                return (
                  <div key={booking._id} className='p-6 hover:bg-gray-600/50 transition-colors'>
                    <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-start md:items-center'>

                      {/* Hotel & Room Info */}
                      <div className='col-span-1 md:col-span-4'>
                        <div className='flex gap-4'>
                          <img src={`https://anonstay-production.up.railway.app/images/${booking.room.images[0]}`} alt={booking.room.roomType} className='w-20 h-14 md:w-24 md:h-20 rounded-lg object-cover flex-shrink-o' />
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold text-gray-200 text-lg mb-1'>
                              {booking.hotel.hotelName}
                            </h3>
                            <p className='text-yellow-600 font-medium mb-1'>
                              {booking.room.roomType}
                            </p>
                            <div className='flex items-center gap-1 text-gray-400 text-sm mb-1'>
                              <MapPin className='w-3 h-3'/>
                              <span className='truncate'>
                                {booking.hotel.hotelAddress}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>ID: {booking._id.slice(-8)}</div>
                            <div className='flex items-center gap-1 text-gray-400 text-sm'>
                              <HousePlus className='w-3 h-3'/>
                              <span>
                                {booking.persons} Room
                                {booking.persons > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates  */}
                      <div className='col-span-1 md:col-span-2'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4 mt-5 text-gray-300'/>
                            <div>
                              <p className='text-sm text-gray-400'>Check-in</p>
                              <p className='font-medium text-gray-200'>
                                {new Date(booking.checkIn).toLocaleDateString("en-NG",{
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4 mt-5 text-gray-300'/>
                            <div>
                              <p className='text-sm text-gray-400'>Check-out</p>
                              <p className='font-medium text-gray-200'>
                                {new Date(booking.checkOut).toLocaleDateString("en-NG",{
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className='col-span-1 md:col-span-2'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            {booking.paymentMethod === "Paystack" ? <CreditCard className='w-4 h-4 text-gray-300'/> : <HandCoins className='w-4 h-4 text-gray-300'/>}
                            <span className='text-sm text-gray-400'>
                              {booking.paymentMethod}
                            </span>
                          </div>
                          <p className='font-bold text-lg text-gray-200'>
                            ₦{Number(booking.totalPrice).toLocaleString('en-NG')}
                          </p>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}>
                            {booking.status === "cancelled" ? (
                              <span className='bg-red-200 text-red-700 rounded-full px-2 py-1'>
                                {booking.status === "no-show" || booking.status === "expired" ? "No Refund" : "Refunded"}
                              </span>
                            ) : (
                              !booking.isPaid ? 
                                <span className='bg-yellow-200 text-yellow-700 rounded-full px-2 py-1'>Unpaid</span>
                                : <span className='bg-green-200 text-green-700 rounded-full px-2 py-1'>Paid</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status  */}
                      <div className='col-span-1 md:col-span-1'>
                        <div className='flex items-center gap-2'>
                          <StatusIcon className={`w-4 h-4 ${getStatusTextColor(booking.status)}`} />
                          <span className={`font-medium capitalize ${getStatusTextColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.status === "cancelled" && booking.cancelledAt && (
                          <p className='text-xs text-gray-500 mt-1'>
                            Cancelled: {new Date(booking.cancelledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Actions  */}
                      <div className='col-span-1 md:col-span-3'>
                        <div className='flex gap-2'>
                          {canCancel && (
                            <div className='flex flex-col items-center justify-center'>
                              <button 
                                onClick={() => openCancelModal(booking._id)}
                                className='p-3 text-sm w-fit flex rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-red-50 cursor-pointer'
                                title='Cancel Booking'
                              >
                                Cancel Booking
                              </button>
                              <span className='text-sm text-gray-500 p-2'>
                                70% refund if cancelled 24-48 hours before check-in
                              </span>
                            </div>
                          )}
                          {!canCancel && booking.status !== "cancelled" && (
                            <span className='text-sm text-gray-500 p-2'>
                              Cannot cancel within 24hrs of check-in
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile View */}
            <div className='md:hidden grid grid-cols-6 bg-gray-950 px-2 text-xl py-4 border-b border-gray-400 font-semibold text-gray-200'>
              <div className='col-span-6 flex items-center justify-center'>Booking Details</div>
            </div>
            <div className='divide-y-4 divide-gray-700 md:hidden'>
              {bookingData.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                const canCancel = canCancelBooking(booking);
                return (
                  <div key={booking._id} className='p-6 hover:bg-gray-600/50 transition-colors'>
                    <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-start md:items-center'>

                      {/* Hotel & Room Info */}
                      <div className='col-span-3 md:col-span-5'>
                        <div className='flex gap-2 md:gap-4'>
                          <img src={`https://anonstay-production.up.railway.app/images/${booking.room.images[0]}`} alt={booking.room.roomType} className='w-20 h-14 md:w-24 md:h-20 rounded-lg object-cover flex-shrink-o' />
                          <div className='flex-1 min-w-0'>
                            <h3 className='font-semibold text-gray-200 text-lg mb-1'>
                              {booking.hotel.hotelName}
                            </h3>
                            <p className='text-yellow-600 font-medium mb-1'>
                              {booking.room.roomType}
                            </p>
                            <div className='flex items-center gap-1 text-gray-400 text-sm mb-1'>
                              <MapPin className='w-3 h-3'/>
                              <span className='truncate'>
                                {booking.hotel.hotelAddress}
                              </span>
                            </div>
                            <div className='text-xs text-gray-500'>ID: {booking._id.slice(-8)}</div>
                            <div className='flex items-center gap-1 text-gray-400 text-sm'>
                              <HousePlus className='w-3 h-3'/>
                              <span>
                                {booking.persons} Room
                                {booking.persons > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates  */}
                      <div className='col-span-1 md:col-span-2'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4 mt-5 text-gray-300'/>
                            <div>
                              <p className='text-sm text-gray-400'>Check-in</p>
                              <p className='font-medium text-gray-200'>
                                {new Date(booking.checkIn).toLocaleDateString("en-NG",{
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='w-4 h-4 mt-5 text-gray-300'/>
                            <div>
                              <p className='text-sm text-gray-400'>Check-out</p>
                              <p className='font-medium text-gray-200'>
                                {new Date(booking.checkOut).toLocaleDateString("en-NG",{
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Payment */}
                      <div className='col-span-1 md:col-span-2'>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            {booking.paymentMethod === "Paystack" ? <CreditCard className='w-4 h-4 text-gray-300'/> : <HandCoins className='w-4 h-4 text-gray-300'/>}
                            <span className='text-sm text-gray-400'>
                              {booking.paymentMethod}
                            </span>
                          </div>
                          <p className='font-bold text-lg text-gray-200'>
                             ₦{Number(booking.totalPrice).toLocaleString('en-NG')}
                          </p>
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}>
                            {booking.status === "cancelled" ? (
                              <span className='bg-red-200 text-red-700 rounded-full px-2 py-1'>
                                {booking.status === "no-show" || booking.status === "expired" ? "No Refund" : "Refunded"}
                              </span>
                            ) : (
                              !booking.isPaid ? 
                                <span className='bg-yellow-200 text-yellow-700 rounded-full px-2 py-1'>Unpaid</span>
                                : <span className='bg-green-200 text-green-700 rounded-full px-2 py-1'>Paid</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status  */}
                      <div className='col-span-1 md:col-span-2'>
                        <div className='flex items-center gap-2'>
                          <StatusIcon className={`w-4 h-4 ${getStatusTextColor(booking.status)}`} />
                          <span className={`font-medium capitalize ${getStatusTextColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        {booking.status === "cancelled" && booking.cancelledAt && (
                          <p className='text-xs text-gray-500 mt-1'>
                            Cancelled: {new Date(booking.cancelledAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {/* Actions for Mobile */}
                      <div className='col-span-1 md:col-span-1'>
                        <div className='flex gap-2 justify-center'>
                          {canCancel && (
                            <button 
                              onClick={() => openCancelModal(booking._id)}
                              className='p-2 text-sm rounded-lg transition-colors bg-red-600 hover:bg-red-700 text-red-50 cursor-pointer'
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
        </div>
      </div>
    </div>
  )
}

export default MyBookings