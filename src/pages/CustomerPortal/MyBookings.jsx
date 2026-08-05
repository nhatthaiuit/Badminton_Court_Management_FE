import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../../api/bookingsApi";
import { useAuth } from "../../hooks/useAuth";
import dayjs from "dayjs";
import { Calendar, Clock, CreditCard } from "lucide-react";
import Modal from "../../components/ui/Modal";

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = useCallback(async () => {
    try {
      // In a real app, the backend should filter by the logged-in user.
      // Here we fetch all and filter by name/phone for the demo.
      const res = await bookingsApi.getAll();
      const userBookings = res.data.data.filter(
        (b) => b.customer_phone === user?.phone
      ).sort((a, b) => b.booking_id - a.booking_id);
      setBookings(userBookings);
    } catch (error) {
      console.error("Failed to fetch my bookings", error);
    } finally {
      setLoading(false);
    }
  }, [user?.phone]);


  
  // View Details Modal
  const [viewBooking, setViewBooking] = useState(null);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-full text-xs font-semibold">Pending Payment</span>;
      case "confirmed":
        return <span className="px-3 py-1 bg-green-100 border border-green-200 text-green-800 rounded-full text-xs font-semibold">Confirmed</span>;
      case "completed":
        return <span className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-800 rounded-full text-xs font-semibold">Completed</span>;
      case "cancelled":
        return <span className="px-3 py-1 bg-red-100 border border-red-200 text-red-800 rounded-full text-xs font-semibold">Cancelled</span>;
      case "refunding":
        return <span className="px-3 py-1 bg-purple-100 border border-purple-200 text-purple-800 rounded-full text-xs font-semibold">Refunding</span>;
      case "refunded":
        return <span className="px-3 py-1 bg-gray-200 border border-gray-300 text-gray-800 rounded-full text-xs font-semibold">Refunded</span>;
      default:
        return <span className="px-3 py-1 bg-gray-200 border border-gray-300 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-primary-600 to-indigo-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 tracking-tight text-white">My Bookings</h1>
          <p className="text-blue-100 max-w-xl text-sm sm:text-base md:text-lg">
            Track and manage your court reservations in one place.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-32 sm:w-48 h-32 sm:h-48 bg-indigo-400 opacity-20 rounded-full blur-2xl transform translate-y-1/2"></div>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {bookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 text-center shadow-sm border border-gray-300">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Calendar className="h-10 w-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">You haven't made any court reservations. Head over to the Book Court page to get started!</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div 
              key={booking.booking_id} 
              onClick={() => setViewBooking(booking)}
              className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm hover:shadow-xl border border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
                <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <h3 className="text-base sm:text-xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{booking.court_name}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
                    <span className="font-medium text-gray-700">{dayjs(booking.booking_date).format("MMM D, YYYY")}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-gray-300">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
                    <span className="font-medium text-gray-700">{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 bg-green-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-green-300 text-green-800 font-bold">
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {parseInt(booking.total_price).toLocaleString()} VND
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
                {booking.status === "pending" && (
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/portal/payment/${booking.booking_id}`); }}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow hover:shadow-md transition-all hover:scale-105 whitespace-nowrap z-10 text-sm"
                  >
                    Pay Now
                  </button>
                )}
                <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-center justify-center h-12 w-12 rounded-full bg-primary-50 text-primary-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Booking Details Modal */}
      {viewBooking && (
        <Modal isOpen={!!viewBooking} onClose={() => setViewBooking(null)} title="Booking Details">
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{viewBooking.court_name}</h3>
                {getStatusBadge(viewBooking.status)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1 text-xs sm:text-sm">Date</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{dayjs(viewBooking.booking_date).format("MMM D, YYYY")}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1 text-xs sm:text-sm">Time</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">{viewBooking.start_time.slice(0,5)} - {viewBooking.end_time.slice(0,5)}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1 text-xs sm:text-sm">Total Price</p>
                  <p className="font-bold text-primary-600 text-base sm:text-lg">{parseInt(viewBooking.total_price).toLocaleString()} VND</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1 text-xs sm:text-sm">Booking ID</p>
                  <p className="font-semibold text-gray-900 text-sm sm:text-base">#{viewBooking.booking_id}</p>
                </div>
              </div>
            </div>

            {viewBooking.note && (
              <div className="text-sm border-t border-gray-300 pt-3 sm:pt-4">
                <p className="text-gray-500 mb-1 text-xs sm:text-sm">Notes:</p>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-300 text-xs sm:text-sm">{viewBooking.note}</p>
              </div>
            )}
            
            <div className="text-xs text-gray-400 text-right">
               Created at: {dayjs(viewBooking.created_at).format("DD/MM/YYYY HH:mm")}
            </div>

            <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-300">
              <button type="button" onClick={() => setViewBooking(null)} className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition text-sm">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MyBookings;
