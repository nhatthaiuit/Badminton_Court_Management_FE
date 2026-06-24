import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { bookingsApi } from "../../api/bookingsApi";
import { courtsApi } from "../../api/courtsApi";
import { ChevronLeft, ChevronRight, Calendar, Plus, PhoneCall, CheckCircle, AlertCircle } from "lucide-react";
import Modal from "../../components/ui/Modal";
import toast from "react-hot-toast";

// Grid configuration
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 09:00 - 21:00
const HOUR_WIDTH = 112; // 112px per hour

const CourtScheduleDashboard = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const initialForm = {
    customer_name: "",
    customer_phone: "",
    court_id: "",
    booking_date: dayjs().format("YYYY-MM-DD"),
    start_time: "09:00",
    end_time: "10:00",
    note: "",
  };
  const [formData, setFormData] = useState(initialForm);

  // View/Edit Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchScheduleData = async () => {
    setLoading(true);
    try {
      // Fetch courts and bookings concurrently
      const [courtsRes, bookingsRes] = await Promise.all([
        courtsApi.getAll(),
        bookingsApi.getAll({ date: currentDate.format("YYYY-MM-DD") })
      ]);
      setCourts(courtsRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (error) {
      console.error("Failed to fetch schedule data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const getPositionStyles = (startTime, endTime) => {
    const startObj = dayjs(`2000-01-01 ${startTime}`, "YYYY-MM-DD HH:mm:ss");
    const endObj = dayjs(`2000-01-01 ${endTime}`, "YYYY-MM-DD HH:mm:ss");
    const baseObj = dayjs(`2000-01-01 09:00:00`, "YYYY-MM-DD HH:mm:ss");
    const startMinutes = startObj.diff(baseObj, "minute");
    const durationMinutes = endObj.diff(startObj, "minute");
    const pixelsPerMinute = HOUR_WIDTH / 60;

    return {
      left: `${startMinutes * pixelsPerMinute}px`,
      width: `${durationMinutes * pixelsPerMinute}px`,
    };
  };

  const nextDay = () => setCurrentDate((prev) => prev.add(1, "day"));
  const prevDay = () => setCurrentDate((prev) => prev.subtract(1, "day"));
  const goToday = () => setCurrentDate(dayjs());

  const handleOpenModal = () => {
    setFormData({ ...initialForm, booking_date: currentDate.format("YYYY-MM-DD") });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.start_time >= formData.end_time) {
        toast.error("End time must be after start time");
        setSubmitting(false);
        return;
      }
      
      await bookingsApi.create(formData);
      toast.success("Booking created successfully!");
      setIsModalOpen(false);
      fetchScheduleData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBooking) return;
    try {
      await bookingsApi.updateStatus(selectedBooking.booking_id, "confirmed"); // 'confirmed' implies paid in this context
      toast.success("Payment marked as PAID (Confirmed)!");
      setSelectedBooking(null);
      fetchScheduleData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={prevDay} className="p-1.5 hover:bg-white rounded-md transition text-gray-600">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 hover:bg-white rounded-md transition text-sm font-medium text-gray-700 mx-1">
              Today
            </button>
            <button onClick={nextDay} className="p-1.5 hover:bg-white rounded-md transition text-gray-600">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <Calendar className="h-5 w-5 text-primary-600" />
            {currentDate.format("dddd, DD MMM YYYY")}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 text-sm">
             <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-400"></div>
              <span className="text-gray-600">Action Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-300"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-300"></div>
              <span className="text-gray-600">Paid/Confirmed</span>
            </div>
          </div>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Grid Container */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto relative custom-scrollbar">
          <div className="min-w-max">
            {/* Header Timeline */}
            <div className="flex border-b border-gray-200 sticky top-0 z-10 bg-gray-50 shadow-sm">
              <div className="w-32 flex-shrink-0 border-r border-gray-200 p-3 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-20">
                Courts
              </div>
              <div className="flex flex-1">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="flex-shrink-0 text-center py-3 text-sm font-medium text-gray-500 border-r border-gray-200"
                    style={{ width: `${HOUR_WIDTH}px` }}
                  >
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </div>
                ))}
              </div>
            </div>

            {/* Court Rows */}
            <div className="relative">
              {courts.map((court) => {
                const courtBookings = bookings.filter(b => b.court_id === court.court_id && b.status !== 'cancelled');
                
                return (
                  <div key={court.court_id} className="flex border-b border-gray-100 group hover:bg-gray-50 transition-colors">
                    <div className="w-32 flex-shrink-0 border-r border-gray-200 p-4 bg-white group-hover:bg-gray-50 sticky left-0 z-10 font-medium text-gray-800">
                      {court.name}
                    </div>
                    
                    <div className="flex-1 relative h-16 cursor-crosshair">
                      {/* Background hour columns lines */}
                      {HOURS.map((hour, idx) => (
                        <div
                          key={`bg-${hour}`}
                          className="absolute top-0 bottom-0 border-r border-gray-100"
                          style={{ left: `${(idx + 1) * HOUR_WIDTH}px` }}
                        ></div>
                      ))}

                      {court.status === "maintenance" ? (
                        <div className="absolute inset-y-1 inset-x-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 font-medium z-10">
                          Maintenance
                        </div>
                      ) : (
                        <>
                          {/* Render Bookings */}
                          {courtBookings.map((booking) => {
                            const styles = getPositionStyles(booking.start_time, booking.end_time);
                            
                            // Check if pending and close to start time (within 1 hour)
                            const now = dayjs();
                            const bookingStart = dayjs(`${booking.booking_date} ${booking.start_time}`);
                            const isCloseToStart = bookingStart.diff(now, 'minute') <= 60 && bookingStart.diff(now, 'minute') > -60;
                            const needsAction = booking.status === 'pending' && isCloseToStart && booking.booking_date === dayjs().format("YYYY-MM-DD");

                            let bgClass = "bg-yellow-100 border-yellow-300 text-yellow-800"; // pending
                            if (booking.status === 'confirmed' || booking.status === 'completed') {
                              bgClass = "bg-green-100 border-green-300 text-green-800";
                            }
                            if (needsAction) {
                              bgClass = "bg-red-50 border-red-400 text-red-800 shadow-sm animate-pulse";
                            }

                            return (
                              <div
                                key={booking.booking_id}
                                onClick={() => setSelectedBooking(booking)}
                                className={`absolute top-1 bottom-1 border rounded-md px-2 py-1 overflow-hidden z-10 hover:shadow-md transition cursor-pointer ${bgClass}`}
                                style={styles}
                                title={`${booking.customer_name} (${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)})`}
                              >
                                <div className="text-xs font-bold truncate flex items-center justify-between">
                                  {booking.customer_name}
                                  {needsAction && <AlertCircle className="h-3 w-3 text-red-500" />}
                                </div>
                                <div className="text-[10px] truncate opacity-80">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Booking">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
              <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" name="customer_phone" required value={formData.customer_phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0901234567" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Court <span className="text-red-500">*</span></label>
            <select name="court_id" required value={formData.court_id} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="" disabled>-- Select a court --</option>
              {courts.filter(c => c.status === "available").map(court => (
                <option key={court.court_id} value={court.court_id}>{court.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" name="booking_date" required value={formData.booking_date} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
              <input type="time" name="start_time" required value={formData.start_time} onChange={handleChange} min="09:00" max="21:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
              <input type="time" name="end_time" required value={formData.end_time} onChange={handleChange} min="09:00" max="21:00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-70 flex items-center">
              {submitting ? "Saving..." : "Create Booking"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking Details / Payment Modal */}
      {selectedBooking && (
        <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking Details">
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedBooking.customer_name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <PhoneCall className="h-4 w-4" />
                    <a href={`tel:${selectedBooking.customer_phone}`} className="hover:text-blue-600 font-medium">{selectedBooking.customer_phone}</a>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedBooking.status === 'pending' ? 'Pending Payment' : 'Paid'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Time Slot</p>
                <p className="font-semibold text-gray-900">{selectedBooking.start_time.slice(0,5)} - {selectedBooking.end_time.slice(0,5)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Total Price</p>
                <p className="font-bold text-gray-900 text-lg">{parseInt(selectedBooking.total_price).toLocaleString()} VND</p>
              </div>
            </div>

            {selectedBooking.status === 'pending' && dayjs(`${selectedBooking.booking_date} ${selectedBooking.start_time}`).diff(dayjs(), 'minute') <= 60 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">This booking starts soon and is not paid. Please call the customer to confirm their arrival.</p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                Close
              </button>
              {selectedBooking.status === 'pending' && (
                <button 
                  onClick={handleMarkAsPaid} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as PAID
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CourtScheduleDashboard;
