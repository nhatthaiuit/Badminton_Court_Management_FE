import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingsApi } from "../../api/bookingsApi";
import { useAuth } from "../../hooks/useAuth";
import dayjs from "dayjs";
import { Calendar, Clock, CreditCard, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    try {
      // In a real app, the backend should filter by the logged-in user.
      // Here we fetch all and filter by name/phone for the demo.
      const res = await bookingsApi.getAll();
      const userBookings = res.data.data.filter(
        (b) => b.customer_phone === user?.phone
      ).sort((a, b) => dayjs(`${b.booking_date} ${b.start_time}`).diff(dayjs(`${a.booking_date} ${a.start_time}`)));
      setBookings(userBookings);
    } catch (error) {
      console.error("Failed to fetch my bookings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const handleCancel = async (booking) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking? If eligible, your refund will be processed manually within 3-5 days."
    );
    if (!confirmCancel) return;
    
    try {
      await bookingsApi.delete(booking.booking_id);
      toast.success("Booking cancelled. Status updated to Refunding.");
      fetchMyBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">Pending Payment</span>;
      case "confirmed":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Confirmed</span>;
      case "completed":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">Completed</span>;
      case "cancelled":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">Cancelled</span>;
      case "refunding":
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">Refunding</span>;
      case "refunded":
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">Refunded</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">{status}</span>;
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
      <div className="bg-gradient-to-r from-blue-700 via-primary-600 to-indigo-600 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight text-white">My Bookings</h1>
          <p className="text-blue-100 max-w-xl text-lg">
            Track and manage your court reservations in one place.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-400 opacity-20 rounded-full blur-2xl transform translate-y-1/2"></div>
      </div>

      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 text-center shadow-sm border border-gray-100">
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
              className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors">{booking.court_name}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Calendar className="h-4 w-4 text-primary-500" />
                    <span className="font-medium text-gray-700">{dayjs(booking.booking_date).format("dddd, MMM D, YYYY")}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Clock className="h-4 w-4 text-primary-500" />
                    <span className="font-medium text-gray-700">{booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 text-green-700 font-bold">
                    <CreditCard className="h-4 w-4" />
                    {parseInt(booking.total_price).toLocaleString()} VND
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                {booking.status === "pending" && (
                  <button
                    onClick={() => navigate(`/portal/payment/${booking.booking_id}`)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow hover:shadow-md transition-all hover:scale-105 whitespace-nowrap"
                  >
                    Pay Now
                  </button>
                )}
                
                {booking.status === "confirmed" && dayjs(`${dayjs(booking.booking_date).format('YYYY-MM-DD')}T${booking.start_time}`).diff(dayjs(), 'hour') >= 2 && (
                  <button
                    onClick={() => handleCancel(booking)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-xl shadow-sm hover:shadow transition-all whitespace-nowrap"
                  >
                    <XCircle className="h-4 w-4" /> Cancel
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
    </div>
  );
};

export default MyBookings;
