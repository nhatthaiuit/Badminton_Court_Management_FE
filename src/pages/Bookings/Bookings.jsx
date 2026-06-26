import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { bookingsApi } from "../../api/bookingsApi";
import { courtsApi } from "../../api/courtsApi";
import { ChevronLeft, ChevronRight, Calendar, Plus, PhoneCall, CheckCircle, AlertCircle, Wrench } from "lucide-react";
import Modal from "../../components/ui/Modal";
import SharedScheduleGrid from "../../components/bookings/SharedScheduleGrid";
import { socket } from "../../api/socket";
import toast from "react-hot-toast";

// Grid configuration
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 09:00 - 21:00
const HOUR_WIDTH = 112; // 112px per hour

const CourtScheduleDashboard = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState("booking"); // "booking" or "maintenance"
  
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

  // Socket.io Listener
  useEffect(() => {
    socket.connect();
    socket.on("schedule_updated", () => {
      fetchScheduleData(); // Refresh data on event
    });
    return () => {
      socket.off("schedule_updated");
      socket.disconnect();
    };
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
    setBookingType("booking");
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

      // Prevent past bookings
      const bookingDateTime = dayjs(`${formData.booking_date} ${formData.start_time}`);
      if (bookingDateTime.isBefore(dayjs())) {
        toast.error("Cannot book a time slot in the past");
        setSubmitting(false);
        return;
      }
      
      let submitData = { ...formData };
      if (bookingType === "maintenance") {
        submitData.customer_name = "Maintenance Block";
        submitData.customer_phone = "0000000000";
        submitData.note = `[MAINTENANCE] ${submitData.note}`;
      }

      const res = await bookingsApi.create(submitData);
      
      // If it's a maintenance block, auto-confirm it so it doesn't show up as pending action
      if (bookingType === "maintenance") {
         await bookingsApi.updateStatus(res.data.data.booking_id, "confirmed");
      }

      toast.success(bookingType === "maintenance" ? "Maintenance scheduled!" : "Booking created!");
      setIsModalOpen(false);
      fetchScheduleData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || "Failed to save";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!selectedBooking) return;
    try {
      await bookingsApi.updateStatus(selectedBooking.booking_id, "confirmed");
      toast.success("Payment marked as PAID (Confirmed)!");
      setSelectedBooking(null);
      fetchScheduleData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    if (window.confirm("Are you sure you want to remove this maintenance block?")) {
      try {
        await bookingsApi.cancel(selectedBooking.booking_id);
        toast.success("Removed successfully!");
        setSelectedBooking(null);
        fetchScheduleData();
      } catch (error) {
        toast.error("Failed to cancel");
      }
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedBooking) return;
    if (window.confirm("Have you successfully transferred the refund back to the customer?")) {
      try {
        await bookingsApi.processRefund(selectedBooking.booking_id);
        toast.success("Refund processed successfully!");
        setSelectedBooking(null);
        fetchScheduleData();
      } catch (error) {
        toast.error("Failed to process refund");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
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
              <span className="text-gray-600">Paid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-purple-100 border border-purple-300"></div>
              <span className="text-gray-600">Refunding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300 border-dashed"></div>
              <span className="text-gray-600">Maintenance</span>
            </div>
          </div>
          <button 
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            New Block
          </button>
        </div>
      </div>

      {/* Grid Container */}
      <SharedScheduleGrid 
        courts={courts}
        bookings={bookings}
        loading={loading}
        role={user?.role || "staff"}
        selectedDate={currentDate.format("YYYY-MM-DD")}
        onBookingClick={(booking) => setSelectedBooking(booking)}
      />

      {/* New Booking / Maintenance Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Block">
        
        <div className="flex mb-6 border-b border-gray-200">
          <button 
            type="button"
            className={`flex-1 pb-3 font-medium text-sm border-b-2 transition-colors ${bookingType === "booking" ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setBookingType("booking")}
          >
            Customer Booking
          </button>
          <button 
            type="button"
            className={`flex-1 pb-3 font-medium text-sm border-b-2 transition-colors ${bookingType === "maintenance" ? "border-gray-800 text-gray-800" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setBookingType("maintenance")}
          >
            Maintenance Slot
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {bookingType === "booking" && (
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
          )}

          {bookingType === "maintenance" && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-600 flex items-start gap-2 mb-4">
               <Wrench className="h-5 w-5 flex-shrink-0 text-gray-500" />
               <p>Create a time-based maintenance block. Customers will not be able to book the court during this time.</p>
            </div>
          )}

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea name="note" value={formData.note} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder={bookingType === "maintenance" ? "Reason for maintenance..." : "Any special requests..."}></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className={`px-4 py-2 text-white rounded-lg font-medium transition disabled:opacity-70 flex items-center ${bookingType === 'maintenance' ? 'bg-gray-800 hover:bg-gray-900' : 'bg-primary-600 hover:bg-primary-700'}`}>
              {submitting ? "Saving..." : (bookingType === "maintenance" ? "Schedule Maintenance" : "Create Booking")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Booking Details / Payment / Maintenance Modal */}
      {selectedBooking && (
        <Modal 
          isOpen={!!selectedBooking} 
          onClose={() => setSelectedBooking(null)} 
          title={selectedBooking.customer_name === "Maintenance Block" ? "Maintenance Details" : "Booking Details"}
        >
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedBooking.customer_name}</h3>
                  {selectedBooking.customer_name !== "Maintenance Block" && (
                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <PhoneCall className="h-4 w-4" />
                      <a href={`tel:${selectedBooking.customer_phone}`} className="hover:text-blue-600 font-medium">{selectedBooking.customer_phone}</a>
                    </div>
                  )}
                </div>
                {selectedBooking.customer_name !== "Maintenance Block" ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' 
                    : selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800'
                    : selectedBooking.status === 'refunding' ? 'bg-purple-100 text-purple-800'
                    : selectedBooking.status === 'refunded' ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedBooking.status === 'pending' ? 'Pending Payment' 
                     : selectedBooking.status === 'confirmed' ? 'Paid'
                     : selectedBooking.status === 'refunding' ? 'Refunding'
                     : selectedBooking.status === 'refunded' ? 'Refunded'
                     : 'Cancelled'}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-200 text-gray-800">
                    Maintenance
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Time Slot</p>
                <p className="font-semibold text-gray-900">{selectedBooking.start_time.slice(0,5)} - {selectedBooking.end_time.slice(0,5)}</p>
              </div>
              {selectedBooking.customer_name !== "Maintenance Block" && (
                <div>
                  <p className="text-gray-500 mb-1">Total Price</p>
                  <p className="font-bold text-gray-900 text-lg">{parseInt(selectedBooking.total_price).toLocaleString()} VND</p>
                </div>
              )}
            </div>
            
            {selectedBooking.note && (
              <div className="text-sm border-t border-gray-100 pt-4">
                <p className="text-gray-500 mb-1">Notes:</p>
                <p className="text-gray-800">{selectedBooking.note}</p>
              </div>
            )}

            {selectedBooking.customer_name !== "Maintenance Block" && selectedBooking.status === 'pending' && dayjs(`${selectedBooking.booking_date} ${selectedBooking.start_time}`).diff(dayjs(), 'minute') <= 60 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3 text-red-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">This booking starts soon and is not paid. Please call the customer to confirm their arrival.</p>
              </div>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              {selectedBooking.customer_name === "Maintenance Block" && (
                <button 
                  onClick={handleCancelBooking} 
                  className="mr-auto px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition flex items-center gap-2"
                >
                  Remove Maintenance
                </button>
              )}

              <button onClick={() => setSelectedBooking(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                Close
              </button>
              {selectedBooking.customer_name !== "Maintenance Block" && selectedBooking.status === 'pending' && (
                <button 
                  onClick={handleMarkAsPaid} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Mark as PAID
                </button>
              )}
              {selectedBooking.status === 'refunding' && (
                <button 
                  onClick={handleProcessRefund} 
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirm Refund Sent
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
