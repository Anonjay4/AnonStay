import React, { useContext, useEffect, useState } from 'react';
import {
  MapPin, CreditCard, HandCoins,
  CheckCircle, Clock, XCircle,
  Search, X, Check
} from "lucide-react";
import { AppContext } from '../../context/AppContext.jsx';
import { toast } from 'react-hot-toast';
import BookingList from '../../components/BookingList.jsx';

// === Utility Functions (outside the component) ===
const getStatusColor = (status) => {
  switch (status) {
    case "confirmed": return "bg-green-500";
    case "checked-in": return "bg-blue-500";
    case "pending": return "bg-yellow-500";
    case "cancelled": return "bg-red-500";
    case "no-show": return "bg-orange-500";
    case "expired": return "bg-gray-500";
    default: return "bg-gray-500";
  }
};

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
    case "checked-in": return CheckCircle;
    case "pending": return Clock;
    case "cancelled": return XCircle;
    case "no-show": return XCircle;
    case "expired": return XCircle;
    default: return Clock;
  }
};

// === Component ===
const Bookings = () => {
  const { axios } = useContext(AppContext);

  // === State Management ===
  const [bookingData, setBookingData] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [paidFilter, setPaidFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // === Data Fetching ===
  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/bookings/hotel");
      if (data.success) {
        setBookingData(data.bookings);
        setFilteredBookings(data.bookings);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm?.trim()) params.append('search', searchTerm.trim());
      if (statusFilter) params.append('status', statusFilter);
      if (paymentFilter) params.append('paymentMethod', paymentFilter);
      if (paidFilter) params.append('isPaid', paidFilter);

      const { data } = await axios.get(`/api/bookings/hotel/search?${params.toString()}`);
      if (data.success) {
        const bookings = Array.isArray(data.bookings) ? data.bookings : [];
        setFilteredBookings(bookings);
        
        if (bookings.length === 0 && (searchTerm || statusFilter || paymentFilter || paidFilter)) {
          toast.info("No bookings found matching your search criteria");
        }
      } else {
        toast.error(data.message || "Failed to search bookings");
        setFilteredBookings([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search bookings. Please try again.");
      setFilteredBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // === Update Functions ===
  const updateBookingStatus = async (bookingId, updates) => {
    try {
      const { data } = await axios.put(`/api/bookings/update-status/${bookingId}`, updates);
      if (data.success) {
        toast.success("Booking updated successfully");
        setFilteredBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId ? { ...booking, ...updates } : booking
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const markAsPaid = (bookingId) => {
    updateBookingStatus(bookingId, { isPaid: true, status: 'confirmed' });
  };

  const updateStatus = (bookingId, status) => {
    updateBookingStatus(bookingId, { status });
  };

  // === Check-in Function ===
  const confirmCheckIn = async (bookingId) => {
    try {
      const { data } = await axios.put(`/api/bookings/check-in/${bookingId}`);
      if (data.success) {
        toast.success("Guest checked in successfully!");
        setFilteredBookings(prev =>
          prev.map(booking =>
            booking._id === bookingId 
              ? { ...booking, status: 'checked-in', checkedInAt: new Date() }
              : booking
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to check in guest");
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPaymentFilter('');
    setPaidFilter('');
    setFilteredBookings(bookingData);
  };

  // === Effects ===
  useEffect(() => {
    fetchMyBookings();
  }, []);

  useEffect(() => {
    if (searchTerm || statusFilter || paymentFilter || paidFilter) {
      handleSearch();
    } else {
      setFilteredBookings(bookingData);
    }
  }, [searchTerm, statusFilter, paymentFilter, paidFilter, bookingData]);

  // === Status Statistics ===
  const getStatusStats = () => {
    const stats = bookingData.reduce((acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    }, {});
    return stats;
  };

  const stats = getStatusStats();

  // === Render ===
  return (
    <div className='min-h-screen bg-gray-950 py-32'>
      <div className='max-w-7xl mx-auto px-4'>

        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-[#fcae26] mb-4 text-4xl font-bold'>
            Hotel Bookings Management
          </h1>
          <p className='text-gray-100 text-lg'>
            Manage all bookings for your hotels. Search, filter, and update booking status.
          </p>
        </div>

        {/* Status Statistics */}
        <div className='grid grid-cols-2 md:grid-cols-6 gap-4 mb-6'>
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className={`${getStatusColor(status)} bg-opacity-20 border border-opacity-30 ${getStatusColor(status).replace('bg-', 'border-')} rounded-lg p-3`}>
              <div className={`${getStatusTextColor(status)} text-lg font-bold`}>{count}</div>
              <div className='text-gray-300 text-sm capitalize'>
                {status === 'checked-in' ? 'Checked In' : 
                 status === 'no-show' ? 'No Show' : status}
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className='bg-gray-900 border border-gray-400 rounded-lg p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-4'>
            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search by ID, hotel name, guest...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#fcae26]'
              />
            </div>

            {/* Status - Updated with new options */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]'
            >
              <option value=''>All Status</option>
              <option value='pending'>Pending</option>
              <option value='confirmed'>Confirmed</option>
              <option value='checked-in'>Checked In</option>
              <option value='cancelled'>Cancelled</option>
              <option value='no-show'>No Show</option>
              <option value='expired'>Expired</option>
            </select>

            {/* Payment Method */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]'
            >
              <option value=''>All Payment Methods</option>
              <option value='Paystack'>Paystack</option>
              <option value='Pay At Hotel'>Pay At Hotel</option>
            </select>

            {/* Paid Status */}
            <select
              value={paidFilter}
              onChange={(e) => setPaidFilter(e.target.value)}
              className='w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]'
            >
              <option value=''>All Payment Status</option>
              <option value='true'>Paid</option>
              <option value='false'>Unpaid</option>
            </select>

            {/* Clear Button */}
            <button
              onClick={clearFilters}
              className='cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors flex items-center justify-center gap-2'
            >
              <X className='w-4 h-4' />
              Clear
            </button>
          </div>

          <div className='text-sm text-gray-400'>
            Showing {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
            {bookingData.length !== filteredBookings.length && ` of ${bookingData.length} total`}
          </div>
        </div>

        <div className='bg-gray-900 border-1 border-gray-400 rounded-2xl shadow-lg overflow-hidden'>
          <BookingList
            bookings={filteredBookings}
            loading={loading}
            markAsPaid={markAsPaid}
            updateStatus={updateStatus}
            confirmCheckIn={confirmCheckIn}
          />
        </div>

      </div>
    </div>
  );
};

export default Bookings;