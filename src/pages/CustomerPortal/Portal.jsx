import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { courtsApi } from "../../api/courtsApi";
import { bookingsApi } from "../../api/bookingsApi";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../../components/ui/Modal";
import SharedScheduleGrid from "../../components/bookings/SharedScheduleGrid";
import { socket } from "../../api/socket";
import toast from "react-hot-toast";
import { Calendar, CheckCircle, AlertCircle } from "lucide-react";

const Portal = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [courtsRes, bookingsRes] = await Promise.all([
        courtsApi.getAll(),
        bookingsApi.getAll({ date: selectedDate })
      ]);
      setCourts(courtsRes.data.data.filter(c => c.status === 'available'));
      // Only care about active bookings to show occupied slots
      setBookings(bookingsRes.data.data.filter(b => b.status !== 'cancelled'));
    } catch (error) {
      console.error("Failed to fetch portal data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  // Socket.io Listener
  useEffect(() => {
    socket.connect();
    socket.on("schedule_updated", () => {
      fetchData(); // Refresh data on event
    });
    return () => {
      socket.off("schedule_updated");
      socket.disconnect();
    };
  }, [selectedDate]);

  const handleSlotClick = (court, time) => {
    // Check if slot is already booked
    const isBooked = bookings.some(
      b => b.court_id === court.court_id && b.start_time.startsWith(time)
    );
    
    // Check if slot is in the past (for today)
    const isPast = selectedDate === dayjs().format("YYYY-MM-DD") && 
                   time < dayjs().format("HH:mm");

    if (isBooked || isPast) return;

    const endTime = `${(parseInt(time) + 1).toString().padStart(2, "0")}:00`;
    setSelectedSlot({ court, startTime: time, endTime });
    setIsModalOpen(true);
  };

  const handleBookingConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await bookingsApi.create({
        court_id: selectedSlot.court.court_id,
        customer_name: user?.full_name || "Customer",
        customer_phone: user?.phone || "0000000000",
        booking_date: selectedDate,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        note: "Booked via Customer Portal"
      });
      
      toast.success("Booking submitted successfully!");
      setIsModalOpen(false);
      fetchData(); // Refresh grid
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book court");
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-primary-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Book Your Court</h1>
          <p className="text-primary-100 max-w-xl">
            Select a date, find an available court, and start playing! All bookings are subject to confirmation at the facility.
          </p>
        </div>
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
           {/* Decorative circles */}
           <div className="w-64 h-64 rounded-full bg-white blur-3xl"></div>
        </div>
      </div>

      {/* Date Selector */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h2 className="font-semibold text-gray-700">Select Date</h2>
        </div>
        <input 
          type="date" 
          value={selectedDate}
          min={dayjs().format("YYYY-MM-DD")}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {/* Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
        <SharedScheduleGrid 
          courts={courts}
          bookings={bookings}
          loading={loading}
          role="customer"
          onEmptySlotClick={handleSlotClick}
        />
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center text-sm text-gray-600">
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-white border border-primary-200"></span> Available</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-100 border border-red-300"></span> Booked</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-gray-100 border border-dashed border-gray-300"></span> Maintenance</div>
      </div>

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Booking">
          <div className="space-y-6">
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
              <h3 className="font-semibold text-primary-900 mb-2">Booking Summary</h3>
              <ul className="space-y-2 text-sm text-primary-800">
                <li><strong>Court:</strong> {selectedSlot.court.name}</li>
                <li><strong>Date:</strong> {dayjs(selectedDate).format("dddd, MMMM D, YYYY")}</li>
                <li><strong>Time:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                Payment will be collected at the facility. Please arrive 10 minutes early. Cancellations must be made at least 2 hours in advance.
              </p>
            </div>

            <form onSubmit={handleBookingConfirm}>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-70">
                  <CheckCircle className="h-4 w-4" />
                  {isSubmitting ? "Confirming..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Portal;
