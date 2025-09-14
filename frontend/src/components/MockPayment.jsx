import React, { useState, useContext, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { CheckCircle, CreditCard, AlertCircle, Clock } from 'lucide-react';

const MockPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axios } = useContext(AppContext);
  
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed
  const [countdown, setCountdown] = useState(3);
  
  const reference = searchParams.get('reference');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (!reference) {
      toast.error('Invalid payment reference');
      navigate('/my-bookings');
      return;
    }

    // Simulate payment processing delay
    const timer = setTimeout(() => {
      processPayment();
    }, 2000);

    return () => clearTimeout(timer);
  }, [reference]);

  const processPayment = async () => {
    setPaymentStatus('processing');
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify payment
      const { data } = await axios.post("/api/bookings/verify-payment", {
        reference: reference
      });
      
      if (data.success) {
        setPaymentStatus('success');
        toast.success('Payment successful!');
        
        // Countdown before redirect
        const countdownTimer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              navigate('/my-bookings');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setPaymentStatus('failed');
        toast.error('Payment verification failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Payment processing error');
      console.error('Mock payment error:', error);
    }
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setCountdown(3);
    processPayment();
  };

  const handleGoToBookings = () => {
    navigate('/my-bookings');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Mock Payment</h1>
          <p className="text-gray-400 text-sm">Demo payment processing</p>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Amount:</span>
            <span className="text-white font-medium">₦{Number(amount).toLocaleString('en-NG')}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Reference:</span>
            <span className="text-white font-mono text-sm">{reference?.slice(-12)}</span>
          </div>
        </div>

        {/* Status Display */}
        <div className="text-center mb-6">
          {paymentStatus === 'pending' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-white mb-2">Initializing Payment</h2>
              <p className="text-gray-400">Please wait...</p>
            </div>
          )}

          {paymentStatus === 'processing' && (
            <div className="flex flex-col items-center">
              <div className="animate-pulse rounded-full h-12 w-12 bg-yellow-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Processing Payment</h2>
              <p className="text-gray-400">Verifying transaction...</p>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="flex flex-col items-center">
              <div className="rounded-full h-12 w-12 bg-green-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-green-400 mb-2">Payment Successful!</h2>
              <p className="text-gray-400 mb-4">Your booking has been confirmed.</p>
              <p className="text-sm text-gray-500">
                Redirecting in {countdown} seconds...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="flex flex-col items-center">
              <div className="rounded-full h-12 w-12 bg-red-600 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-red-400 mb-2">Payment Failed</h2>
              <p className="text-gray-400 mb-4">Something went wrong with your payment.</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {paymentStatus === 'failed' && (
            <>
              <button
                onClick={handleRetry}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Retry Payment
              </button>
              <button
                onClick={handleGoToBookings}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Go to My Bookings
              </button>
            </>
          )}

          {paymentStatus === 'success' && (
            <button
              onClick={handleGoToBookings}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              View My Bookings
            </button>
          )}
        </div>

        {/* Mock Payment Notice */}
        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">Demo Mode:</span>
          </div>
          <p className="text-yellow-300 text-xs mt-1">
            This is a simulated payment for testing purposes. No actual payment was processed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
