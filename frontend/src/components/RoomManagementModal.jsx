import React, { useState } from 'react';
import { X, DollarSign, Percent, Calendar, Tag } from 'lucide-react';

const RoomManagementModal = ({ room, isOpen, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('price');
  const [priceData, setPriceData] = useState({
    pricePerNight: room.pricePerNight || ''
  });
  const [discountData, setDiscountData] = useState({
    discountPercentage: room.discountPercentage || '',
    discountStartDate: room.discountStartDate ? new Date(room.discountStartDate).toISOString().split('T')[0] : '',
    discountEndDate: room.discountEndDate ? new Date(room.discountEndDate).toISOString().split('T')[0] : '',
    discountTitle: room.discountTitle || 'Limited Time Offer'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePriceUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/room/update-price/${room._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ pricePerNight: Number(priceData.pricePerNight) })
      });

      const data = await response.json();
      if (data.success) {
        onUpdate(data.room);
        alert('Price updated successfully!');
      } else {
        alert(data.message || 'Failed to update price');
      }
    } catch (error) {
      alert('Error updating price: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/room/update-discount/${room._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          discountPercentage: Number(discountData.discountPercentage),
          discountStartDate: discountData.discountStartDate,
          discountEndDate: discountData.discountEndDate,
          discountTitle: discountData.discountTitle
        })
      });

      const data = await response.json();
      if (data.success) {
        onUpdate(data.room);
        alert('Discount added successfully!');
      } else {
        alert(data.message || 'Failed to add discount');
      }
    } catch (error) {
      alert('Error adding discount: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async () => {
    if (!confirm('Are you sure you want to remove the discount?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/room/remove-discount/${room._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        onUpdate(data.room);
        setDiscountData({
          discountPercentage: '',
          discountStartDate: '',
          discountEndDate: '',
          discountTitle: 'Limited Time Offer'
        });
        alert('Discount removed successfully!');
      } else {
        alert(data.message || 'Failed to remove discount');
      }
    } catch (error) {
      alert('Error removing discount: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = () => {
    const price = Number(priceData.pricePerNight) || room.pricePerNight;
    const discount = Number(discountData.discountPercentage);
    if (price && discount) {
      return (price * (1 - discount / 100)).toFixed(2);
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Manage Room</h2>
            <p className="text-gray-400 text-sm mt-1">{room.roomType}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('price')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'price'
                ? 'text-[#fcae26] border-b-2 border-[#fcae26]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Update Price
          </button>
          <button
            onClick={() => setActiveTab('discount')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'discount'
                ? 'text-[#fcae26] border-b-2 border-[#fcae26]'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Percent className="w-4 h-4 inline mr-2" />
            Manage Discount
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'price' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Current Price per Night
                </label>
                <div className="text-2xl font-bold text-[#fcae26]">
                  ₦{Number(room.pricePerNight).toLocaleString('en-NG')}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Price per Night
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">₦</span>
                  <input
                    type="number"
                    value={priceData.pricePerNight}
                    onChange={(e) => setPriceData({ pricePerNight: e.target.value })}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]"
                    placeholder="Enter new price"
                    min="0"
                  />
                </div>
              </div>

              {room.hasDiscount && (
                <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                  <p className="text-yellow-500 text-sm">
                    ⚠️ This room has an active discount. Updating the price will automatically recalculate the discounted price.
                  </p>
                </div>
              )}

              <button
                onClick={handlePriceUpdate}
                disabled={loading || !priceData.pricePerNight}
                className="w-full py-3 bg-[#fcae26] hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Updating...' : 'Update Price'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {room.hasDiscount && (
                <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-green-400 font-medium">Active Discount</p>
                      <p className="text-gray-300 text-sm mt-1">{room.discountTitle}</p>
                    </div>
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">
                      {room.discountPercentage}% OFF
                    </span>
                  </div>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Original: ₦{Number(room.pricePerNight).toLocaleString('en-NG')}</p>
                    <p>Discounted: ₦{Number(room.discountedPrice).toLocaleString('en-NG')}</p>
                    <p>Valid: {new Date(room.discountStartDate).toLocaleDateString()} - {new Date(room.discountEndDate).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={handleRemoveDiscount}
                    disabled={loading}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                  >
                    Remove Discount
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Discount Title
                </label>
                <input
                  type="text"
                  value={discountData.discountTitle}
                  onChange={(e) => setDiscountData({ ...discountData, discountTitle: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]"
                  placeholder="e.g., Summer Sale, Early Bird Offer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Discount Percentage (1-90%)
                </label>
                <input
                  type="number"
                  value={discountData.discountPercentage}
                  onChange={(e) => setDiscountData({ ...discountData, discountPercentage: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]"
                  placeholder="Enter discount percentage"
                  min="1"
                  max="90"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={discountData.discountStartDate}
                    onChange={(e) => setDiscountData({ ...discountData, discountStartDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    value={discountData.discountEndDate}
                    onChange={(e) => setDiscountData({ ...discountData, discountEndDate: e.target.value })}
                    min={discountData.discountStartDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#fcae26]"
                  />
                </div>
              </div>

              {calculateDiscountedPrice() && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">Preview</p>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 line-through">
                      ₦{Number(priceData.pricePerNight || room.pricePerNight).toLocaleString('en-NG')}
                    </span>
                    <span className="text-2xl font-bold text-[#fcae26]">
                      ₦{Number(calculateDiscountedPrice()).toLocaleString('en-NG')}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                      {discountData.discountPercentage}% OFF
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleDiscountUpdate}
                disabled={loading || !discountData.discountPercentage || !discountData.discountStartDate || !discountData.discountEndDate}
                className="w-full py-3 bg-[#fcae26] hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                {loading ? 'Processing...' : (room.hasDiscount ? 'Update Discount' : 'Add Discount')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomManagementModal;