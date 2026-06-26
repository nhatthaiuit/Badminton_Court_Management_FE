import { useState, useEffect } from "react";
import { bookingsApi } from "../../api/bookingsApi";
import { useAuth } from "../../hooks/useAuth";
import dayjs from "dayjs";
import { Calendar, Clock, CreditCard } from "lucide-react";

const MyBookings = () => {
  const { user } = useAuth();
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
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">My Bookings</h1>
        <p className="text-gray-500">View and manage your court reservations.</p>
      </div>

      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500">You haven't made any court reservations yet.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div key={booking.booking_id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-md">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{booking.court_name}</h3>
                  {getStatusBadge(booking.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {dayjs(booking.booking_date).format("dddd, MMM D, YYYY")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-primary-700">
                    <CreditCard className="h-4 w-4" />
                    ${parseFloat(booking.total_price).toFixed(2)}
                  </div>
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
