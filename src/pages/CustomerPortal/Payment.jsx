import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { Clock, CreditCard, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins = 900 secs
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      const data = response.data.data;
      
      if (data.status !== "pending") {
        toast.error("This booking has already been processed.");
        navigate("/portal/my-bookings", { replace: true });
        return;
      }
      
      setBooking(data);
      
      // Calculate time left based on created_at
      const createdTime = dayjs(data.created_at);
      const now = dayjs();
      const diffSecs = now.diff(createdTime, "second");
      const remaining = Math.max(0, 900 - diffSecs);
      
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        toast.error("Payment timeout. Booking cancelled.");
        navigate("/portal/my-bookings", { replace: true });
      }
    } catch (error) {
      toast.error("Failed to load booking details");
      navigate("/portal", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || !booking) return;

    if (timeLeft <= 0) {
      toast.error("Payment timeout. Booking cancelled.");
      navigate("/portal/my-bookings", { replace: true });
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, loading, booking, navigate]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleMockPay = async () => {
    try {
      setIsProcessing(true);
      await axiosInstance.post("/payments/mock-pay", { booking_id: bookingId });
      toast.success("Payment successful! Booking confirmed.");
      navigate("/portal/my-bookings", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Payment failed");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!booking) return null;

  const isWarning = timeLeft < 300; // Less than 5 mins

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Complete Your Payment</h1>
        <p className="text-gray-500">Secure your booking by completing the payment within the time limit.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-4">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Court</p>
                <p className="font-semibold text-gray-900">{booking.court_name || `Court ${booking.court_id}`}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold text-gray-900">{dayjs(booking.booking_date).format("MMM D, YYYY")}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Time Slot</p>
                <p className="font-semibold text-gray-900">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="font-medium text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-primary-600">${Number(booking.total_price).toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Action */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className={`rounded-xl p-4 flex items-center justify-between border ${isWarning ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
            <div className="flex items-center gap-3">
              <Clock className={`h-5 w-5 ${isWarning ? 'text-red-500 animate-pulse' : 'text-orange-500'}`} />
              <span className={`font-medium ${isWarning ? 'text-red-700' : 'text-orange-700'}`}>
                Time remaining to pay
              </span>
            </div>
            <span className={`text-xl font-mono font-bold ${isWarning ? 'text-red-600' : 'text-orange-600'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Note:</strong> This is a mock payment gateway for demonstration purposes.</p>
                <p>In a real production environment, this would integrate with VNPAY, MoMo, or PayOS via QR code scanning.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-300">
            <div className="w-40 h-40 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center mb-4">
               {/* Placeholder for QR Code */}
               <div className="text-center">
                 <div className="w-24 h-24 bg-gray-200 mx-auto mb-2 grid grid-cols-2 gap-1 p-1">
                   <div className="bg-gray-400"></div><div className="bg-gray-400"></div>
                   <div className="bg-gray-400"></div><div className="bg-gray-400"></div>
                 </div>
                 <span className="text-xs text-gray-500">Mock QR Code</span>
               </div>
            </div>
            <p className="text-sm text-gray-600 text-center">Scan with your banking app or use the mock button below to simulate success.</p>
          </div>

          <button
            onClick={handleMockPay}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Simulate Successful Payment
                <ArrowRight className="h-4 w-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
