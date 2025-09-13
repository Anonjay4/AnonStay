import React from 'react';
import {
  MapPin, CreditCard, HandCoins,
  CheckCircle, Clock, XCircle,
  Check, UserCheck, AlertTriangle, 
  Lock, CalendarX
} from "lucide-react";

const getStatusTextColor = (status) => {
  switch (status) {
    case "confirmed": return "text-green-500";
    case "checked-in": return "text-blue-500";
    case "pending": return "text-yellow-500";
    case "cancelled": return "text-red-500";
    case "no-show": return "text-orange-500";
    case "expired": return "text-gray-500";
    default: return "text-gray-500";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed": return CheckCircle;
    case "checked-in": return UserCheck;
    case "pending": return Clock;
    case "cancelled": return XCircle;
    case "no-show": return AlertTriangle;
    case "expired": return CalendarX;
    default: return Clock;
  }
};

const BookingList = ({ bookings, loading, markAsPaid, updateStatus, confirmCheckIn }) => {
  if (loading) {
    return <div className='p-8 text-center text-gray-400'>Loading bookings...</div>;
  }

  if (bookings.length === 0) {
    return <div className='p-8 text-center text-gray-400'>No bookings found matching your criteria.</div>;
  }

  const isCheckInDay = (checkInDate) => {
    const today = new Date();
    const checkIn = new Date(checkInDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    checkIn.setHours(0, 0, 0, 0);
    
    return today.getTime() === checkIn.getTime();
  };

  const isCheckInPassed = (checkInDate) => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    return now > checkIn;
  };

  const getTimeUntilCheckIn = (checkInDate) => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const timeDiff = checkIn.getTime() - now.getTime();
    const hoursDiff = Math.floor(timeDiff / (1000 * 3600));
    const daysDiff = Math.floor(hoursDiff / 24);
    
    if (daysDiff > 0) return `${daysDiff} day${daysDiff > 1 ? 's' : ''} until check-in`;
    if (hoursDiff > 0) return `${hoursDiff} hour${hoursDiff > 1 ? 's' : ''} until check-in`;
    return 'Check-in time passed';
  };

  const canMarkAsPaid = (booking) => {
      if (booking.isLocked) return false;
      
      return !booking.isPaid && 
            booking.paymentMethod === "Pay At Hotel" && 
            !["cancelled", "no-show", "expired"].includes(booking.status) && 
            isCheckInDay(booking.checkIn);
  };

  const canCheckIn = (booking) => {
      if (booking.isLocked) return false;
      
      return booking.status === "confirmed" && 
            booking.isPaid && 
            isCheckInDay(booking.checkIn);
  };

  const canTakeAction = (booking) => {
    // Check if booking is locked first
    if (booking.isLocked) return false;
    
    // Check if more than 48 hours have passed since check-in
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursSinceCheckIn = (now - checkIn) / (1000 * 3600);
    if (hoursSinceCheckIn > 48) return false;
    
    // Original logic
    return !["cancelled", "checked-in", "no-show", "expired"].includes(booking.status);
};

  return (
    <>
      {/* Desktop View */}
      <div className='divide-y divide-gray-700 hidden md:block'>
        {bookings.map((booking) => {
          const StatusIcon = getStatusIcon(booking.status);
          const checkInPassed = isCheckInPassed(booking.checkIn);
          const isToday = isCheckInDay(booking.checkIn);
          const actionable = canTakeAction(booking);
          
          return (
            <div key={booking._id} className={`p-6 hover:bg-gray-600/50 transition-colors ${
              ["no-show", "expired"].includes(booking.status) ? 'opacity-75' : ''
            }`}>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-6 items-start md:items-center'>
                {/* Hotel & Room */}
                <div className='col-span-4'>
                  <div className='flex gap-4'>
                    <img
                      src={`https://anonstay-production.up.railway.app/images/${booking.room.images[0]}`}
                      alt={booking.room.roomType}
                      className='w-24 h-20 rounded-lg object-cover flex-shrink-0'
                    />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-gray-200 text-lg mb-1'>{booking.hotel.hotelName}</h3>
                      <p className='text-yellow-600 font-medium mb-1'>{booking.room.roomType}</p>
                      <div className='flex items-center gap-1 text-gray-400 text-sm mb-1'>
                        <MapPin className='w-3 h-3' />
                        <span className='truncate'>{booking.hotel.hotelAddress}</span>
                      </div>
                      <div className='text-xs text-gray-500'>ID: {booking._id.slice(-8)}</div>
                      {isToday && booking.status !== "cancelled" && (
                        <div className='text-xs text-green-400 font-medium mt-1'>
                          ✓ Check-in day - Today!
                        </div>
                      )}
                      {checkInPassed && !isToday && actionable && (
                        <div className='text-xs text-orange-400 font-medium mt-1'>
                          ⚠ Check-in date passed
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Guest & Dates */}
                <div className='col-span-3'>
                  <div className='space-y-2 text-sm'>
                    <div>
                      <p className='text-gray-400'>Guest:</p>
                      <p className='text-gray-200 font-medium'>{booking.user?.name || 'N/A'}</p>
                    </div>
                    <div className='flex gap-2'>
                      <p className='text-gray-400'>Check-in:</p>
                      <p className='text-gray-200'>
                        {new Date(booking.checkIn).toLocaleDateString("en-NG", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <p className='text-gray-400'>Check-out:</p>
                      <p className='text-gray-200'>
                        {new Date(booking.checkOut).toLocaleDateString("en-NG", {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </p>
                    </div>
                    <p className='text-gray-400'>Rooms: {booking.persons}</p>
                    {actionable && (
                      <p className='text-xs text-gray-500'>
                        {getTimeUntilCheckIn(booking.checkIn)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className='col-span-2'>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-gray-400'>
                      {booking.paymentMethod === "Paystack" ? <CreditCard className='w-4 h-4' /> : <HandCoins className='w-4 h-4' />}
                      <span>{booking.paymentMethod}</span>
                    </div>
                    <p className='font-bold text-lg text-gray-200'>₦{Number(booking.totalPrice).toLocaleString('en-NG')}</p>
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

                {/* Status */}
                <div className='col-span-2'>
                  <div className='flex items-center gap-2'>
                    <StatusIcon className={`w-4 h-4 ${getStatusTextColor(booking.status)}`} />
                    <span className={`font-medium capitalize ${getStatusTextColor(booking.status)}`}>
                      {booking.status === "checked-in" ? "Checked In" : 
                       booking.status === "no-show" ? "No Show" : booking.status}
                    </span>
                  </div>
                  {booking.status === "cancelled" && booking.cancelledAt && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Cancelled: {new Date(booking.cancelledAt).toLocaleDateString()}
                    </p>
                  )}
                  {booking.status === "checked-in" && booking.checkedInAt && (
                    <p className='text-xs text-green-500 mt-1'>
                      Checked in: {new Date(booking.checkedInAt).toLocaleDateString()}
                    </p>
                  )}
                  {booking.status === "no-show" && booking.noShowMarkedAt && (
                    <p className='text-xs text-orange-500 mt-1'>
                      No-show: {new Date(booking.noShowMarkedAt).toLocaleDateString()}
                    </p>
                  )}
                  {booking.status === "expired" && booking.expiredAt && (
                    <p className='text-xs text-gray-500 mt-1'>
                      Expired: {new Date(booking.expiredAt).toLocaleDateString()}
                    </p>
                  )}
                  {booking.isLocked && (
                      <div className='flex items-center gap-1 text-xs text-gray-500 mt-1'>
                          <Lock className='w-3 h-3' />
                          <span>Locked - No actions available</span>
                      </div>
                  )}
                </div>

                {/* Actions */}
                <div className='col-span-1 flex flex-wrap gap-2'>
                  {canMarkAsPaid(booking) && (
                    <button
                      onClick={() => markAsPaid(booking._id)}
                      className='px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-md flex items-center gap-1'
                      title="Mark as paid - only available on check-in day"
                    >
                      <Check className='w-3 h-3' />
                      Mark Paid
                    </button>
                  )}
                  {canCheckIn(booking) && (
                    <button
                      onClick={() => confirmCheckIn(booking._id)}
                      className='px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-md flex items-center gap-1'
                      title="Confirm guest has checked in"
                    >
                      <UserCheck className='w-3 h-3' />
                      Check In
                    </button>
                  )}
                  {booking.status === "pending" && (
                    <button
                      onClick={() => updateStatus(booking._id, "confirmed")}
                      className='px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-md'
                    >
                      Confirm
                    </button>
                  )}
                  {actionable && (
                    <button
                      onClick={() => {
                        const reason = checkInPassed 
                          ? "Guest did not show up for check-in" 
                          : window.prompt("Reason for cancellation (optional):") || "Cancelled by hotel";
                        
                        if (window.confirm(`Are you sure you want to cancel this booking?${booking.isPaid ? ' This will initiate a refund process.' : ''}`)) {
                          updateStatus(booking._id, "cancelled");
                        }
                      }}
                      className={`px-3 py-1 text-white text-xs rounded-md ${
                        checkInPassed 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                      title={checkInPassed ? "Cancel - Guest didn't show up" : "Cancel booking"}
                    >
                      {checkInPassed ? "No-Show" : "Cancel"}
                    </button>
                  )}
                  
                  {!actionable && (
                    <span className='text-xs text-gray-500 px-2 py-1 bg-gray-700 rounded'>
                      No Actions Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className='divide-y-4 divide-gray-700 md:hidden'>
        {bookings.map((booking) => {
          const StatusIcon = getStatusIcon(booking.status);
          const checkInPassed = isCheckInPassed(booking.checkIn);
          const isToday = isCheckInDay(booking.checkIn);
          const actionable = canTakeAction(booking);
          
          return (
            <div key={booking._id} className={`p-6 hover:bg-gray-600/50 transition-colors ${
              ["no-show", "expired"].includes(booking.status) ? 'opacity-75' : ''
            }`}>
              <div className='grid grid-cols-1 gap-6'>
                {/* Hotel Info */}
                <div className='flex gap-2'>
                  <img
                    src={`https://anonstay-production.up.railway.app/images/${booking.room.images[0]}`}
                    alt={booking.room.roomType}
                    className='w-20 h-14 rounded-lg object-cover flex-shrink-0'
                  />
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-semibold text-gray-200 text-lg mb-1'>{booking.hotel.hotelName}</h3>
                    <p className='text-yellow-600 font-medium mb-1'>{booking.room.roomType}</p>
                    <div className='flex items-center gap-1 text-gray-400 text-sm'>
                      <MapPin className='w-3 h-3' />
                      <span className='truncate'>{booking.hotel.hotelAddress}</span>
                    </div>
                    <div className='text-xs text-gray-500'>ID: {booking._id.slice(-8)}</div>
                    {isToday && actionable && (
                      <div className='text-xs text-green-400 font-medium mt-1'>
                        Check-in day - Today!
                      </div>
                    )}
                    {checkInPassed && !isToday && actionable && (
                      <div className='text-xs text-orange-400 font-medium mt-1'>
                        Check-in date passed
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex'>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <div className='flex gap-2'>
                        <p className='text-gray-400'>Guest:</p>
                        <p className='text-gray-200 font-medium'>{booking.user?.name || 'N/A'}</p>
                      </div>
                      <p className='text-gray-400'>Rooms: {booking.persons}</p>
                    </div>
                    <div className='flex justify-between'>
                      <div className='flex gap-2'>
                        <p className='text-gray-400'>Check-in:</p>
                        <p className='text-gray-200'>
                          {new Date(booking.checkIn).toLocaleDateString("en-NG", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </p>
                      </div>
                      <div className='flex gap-2'>
                        <p className='text-gray-400'>Check-out:</p>
                        <p className='text-gray-200'>
                          {new Date(booking.checkOut).toLocaleDateString("en-NG", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </p>
                      </div>
                    </div>
                    {actionable && (
                      <p className='text-xs text-gray-500'>
                        {getTimeUntilCheckIn(booking.checkIn)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment & Status */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-400 mb-1'>Payment</p>
                    <p className='font-bold text-gray-200'>
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
                  <div>
                    <p className='text-sm text-gray-400 mb-1'>Status</p>
                    <div className='flex flex-wrap items-center gap-2'>
                      <StatusIcon className={`w-4 h-4 ${getStatusTextColor(booking.status)}`} />
                      <span className={`font-medium capitalize ${getStatusTextColor(booking.status)}`}>
                        {booking.status === "checked-in" ? "Checked In" : 
                         booking.status === "no-show" ? "No Show" : booking.status}
                      </span>
                      <div className='text-gray-100 flex items-center gap-2'>
                        {booking.paymentMethod === "Paystack" ? <CreditCard className='w-4 h-4' /> : <HandCoins className='w-4 h-4' />}
                        <span>{booking.paymentMethod}</span>
                      </div>
                    </div>
                    {booking.status === "cancelled" && booking.cancelledAt && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Cancelled: {new Date(booking.cancelledAt).toLocaleDateString()}
                      </p>
                    )}
                    {booking.status === "checked-in" && booking.checkedInAt && (
                      <p className='text-xs text-green-500 mt-1'>
                        Checked in: {new Date(booking.checkedInAt).toLocaleDateString()}
                      </p>
                    )}
                    {booking.status === "no-show" && booking.noShowMarkedAt && (
                      <p className='text-xs text-orange-500 mt-1'>
                        No-show: {new Date(booking.noShowMarkedAt).toLocaleDateString()}
                      </p>
                    )}
                    {booking.status === "expired" && booking.expiredAt && (
                      <p className='text-xs text-gray-500 mt-1'>
                        Expired: {new Date(booking.expiredAt).toLocaleDateString()}
                      </p>
                    )}
                    {booking.isLocked && (
                        <div className='flex items-center gap-1 text-xs text-gray-500 mt-1'>
                            <Lock className='w-3 h-3' />
                            <span>Locked - No actions available</span>
                        </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className='flex flex-wrap gap-2 pt-2 border-t border-gray-700 items-center justify-center'>
                  {canMarkAsPaid(booking) && (
                    <button
                      onClick={() => markAsPaid(booking._id)}
                      className='px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md flex items-center gap-1'
                      title="Mark as paid - only available on check-in day"
                    >
                      <Check className='w-4 h-4' />
                      Mark Paid
                    </button>
                  )}
                  {canCheckIn(booking) && (
                    <button
                      onClick={() => confirmCheckIn(booking._id)}
                      className='px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center gap-1'
                    >
                      <UserCheck className='w-4 h-4' />
                      Check In
                    </button>
                  )}
                  {booking.status === "pending" && (
                    <button
                      onClick={() => updateStatus(booking._id, "confirmed")}
                      className='px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md'
                    >
                      Confirm
                    </button>
                  )}
                  {actionable && (
                    <button
                      onClick={() => {
                        const reason = checkInPassed 
                          ? "Guest did not show up for check-in" 
                          : window.prompt("Reason for cancellation (optional):") || "Cancelled by hotel";
                        
                        if (window.confirm(`Are you sure you want to cancel this booking?${booking.isPaid ? ' This will initiate a refund process.' : ''}`)) {
                          updateStatus(booking._id, "cancelled");
                        }
                      }}
                      className={`px-3 py-3 text-white text-sm rounded-md ${
                        checkInPassed 
                          ? 'bg-orange-600 hover:bg-orange-700' 
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {checkInPassed ? "No-Show" : "Cancel"}
                    </button>
                  )}
                  
                  {!actionable && (
                    <span className='text-xs text-gray-500 px-3 py-2 bg-gray-700 rounded'>
                      No Actions Available
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  )
}
  export default BookingList