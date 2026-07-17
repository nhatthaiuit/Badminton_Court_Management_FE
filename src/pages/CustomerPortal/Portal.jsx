import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { courtsApi } from "../../api/courtsApi";
import { bookingsApi } from "../../api/bookingsApi";
import { useAuth } from "../../hooks/useAuth";
import Modal from "../../components/ui/Modal";
import SharedScheduleGrid from "../../components/bookings/SharedScheduleGrid";
import { socket } from "../../api/socket";
import toast from "react-hot-toast";
import { Calendar, CheckCircle, AlertCircle, Plus } from "lucide-react";

const Portal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [note, setNote] = useState("");

  // Manual Booking Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualFormData, setManualFormData] = useState({
    court_id: "",
    start_time: "17:00",
    end_time: "18:00",
    note: ""
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
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
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  }, [fetchData]);

  const handleSlotSelect = (court, startTime, endTime) => {
    // Check if slot is in the past (for today)
    const isPast = selectedDate === dayjs().format("YYYY-MM-DD") && 
                   startTime < dayjs().format("HH:mm");

    if (isPast) {
      toast.error("Cannot book past time slots.");
      return;
    }

    // Check for overlap with existing bookings
    const startHour = parseInt(startTime.split(":")[0]);
    const endHour = parseInt(endTime.split(":")[0]);
    let hasOverlap = false;

    for (let i = startHour; i < endHour; i++) {
       const timeStr = `${i.toString().padStart(2, "0")}:00`;
       const isBooked = bookings.some(b => b.court_id === court.court_id && b.start_time.startsWith(timeStr));
       if (isBooked) {
          hasOverlap = true;
          break;
       }
    }

    if (hasOverlap) {
      toast.error("One or more selected slots are already booked.");
      return;
    }

    setSelectedSlot({ court, startTime, endTime });
    setNote("");
    setIsModalOpen(true);
  };

  const handleBookingConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await bookingsApi.create({
        court_id: selectedSlot.court.court_id,
        customer_name: user?.full_name || "Customer",
        customer_phone: user?.phone || "0000000000",
        booking_date: selectedDate,
        start_time: selectedSlot.startTime,
        end_time: selectedSlot.endTime,
        note: note.trim() || "Booked via Customer Portal"
      });
      
      const newBookingId = res.data.data.booking_id;
      toast.success("Slot secured! Please complete payment.");
      setIsModalOpen(false);
      navigate(`/portal/payment/${newBookingId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book court");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (manualFormData.start_time >= manualFormData.end_time) {
      toast.error("Start time must be before end time");
      return;
    }

    const isPast = selectedDate === dayjs().format("YYYY-MM-DD") && 
                   manualFormData.start_time < dayjs().format("HH:mm");

    if (isPast) {
      toast.error("Cannot book past time slots.");
      return;
    }

    const startHour = parseInt(manualFormData.start_time.split(":")[0]);
    const endHour = parseInt(manualFormData.end_time.split(":")[0]);
    let hasOverlap = false;

    for (let i = startHour; i < endHour; i++) {
       const timeStr = `${i.toString().padStart(2, "0")}:00`;
       const isBooked = bookings.some(b => b.court_id === parseInt(manualFormData.court_id) && b.start_time.startsWith(timeStr));
       if (isBooked) {
          hasOverlap = true;
          break;
       }
    }

    if (hasOverlap) {
      toast.error("One or more selected slots are already booked.");
      return;
    }

    setManualSubmitting(true);
    try {
      const res = await bookingsApi.create({
        court_id: manualFormData.court_id,
        customer_name: user?.full_name || "Customer",
        customer_phone: user?.phone || "0000000000",
        booking_date: selectedDate,
        start_time: manualFormData.start_time,
        end_time: manualFormData.end_time,
        note: manualFormData.note.trim() || "Booked via Customer Portal"
      });
      
      const newBookingId = res.data.data.booking_id;
      toast.success("Slot secured! Please complete payment.");
      setIsManualModalOpen(false);
      navigate(`/portal/payment/${newBookingId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book court");
    } finally {
      setManualSubmitting(false);
    }
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">Book Your Court</h1>
          <p className="text-blue-100 max-w-xl text-lg">
            Select a date, find an available court, and start playing! All bookings are subject to confirmation at the facility.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="absolute bottom-0 right-1/3 w-48 h-48 bg-indigo-300 opacity-20 rounded-full blur-2xl transform translate-y-1/3"></div>
      </div>

      {/* Date Selector */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary-600 shadow-inner border border-blue-100/50">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">Select Date</h2>
            <p className="text-sm text-gray-500">Pick a day to view court availability</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={selectedDate}
            min={dayjs().format("YYYY-MM-DD")}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none shadow-sm cursor-pointer transition-shadow hover:shadow"
          />
          <button onClick={() => setIsManualModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition shadow-sm whitespace-nowrap">
            <Plus className="h-5 w-5" />
            Create Booking
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-3xl shadow-lg border-0 ring-1 ring-gray-100 overflow-hidden flex flex-col max-h-[600px] transition-all hover:shadow-xl">
        <SharedScheduleGrid 
          courts={courts}
          bookings={bookings}
          loading={loading}
          role="customer"
          selectedDate={selectedDate}
          onSlotSelect={handleSlotSelect}
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
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800 space-y-1">
                <p><strong>Payment Required:</strong> You will be redirected to the payment page. Please complete your payment within 15 minutes to secure your slot.</p>
                <p><strong>Strict Policy:</strong> Bookings are strictly non-refundable once confirmed.</p>
              </div>
            </div>

            <form onSubmit={handleBookingConfirm}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Note to Staff (Optional)</label>
                <textarea 
                  value={note} 
                  onChange={(e) => setNote(e.target.value)} 
                  rows="2" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" 
                  placeholder="E.g. I need to rent 2 rackets..."
                ></textarea>
              </div>

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

      {/* Manual Booking Modal */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Create Booking">
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex gap-3 mb-4">
             <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
             <div className="text-sm text-yellow-800 space-y-1">
               <p><strong>Payment Required:</strong> You will be redirected to the payment page. Please complete your payment within 15 minutes to secure your slot.</p>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Court <span className="text-red-500">*</span></label>
            <select name="court_id" required value={manualFormData.court_id} onChange={handleManualChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="" disabled>-- Select a court --</option>
              {courts.filter(c => c.status === "available").map(court => (
                <option key={court.court_id} value={court.court_id}>{court.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="text" disabled value={dayjs(selectedDate).format("dddd, MMMM D, YYYY")} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time <span className="text-red-500">*</span></label>
              <input type="time" name="start_time" required value={manualFormData.start_time} onChange={handleManualChange} min="05:00" max="23:59" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time <span className="text-red-500">*</span></label>
              <input type="time" name="end_time" required value={manualFormData.end_time} onChange={handleManualChange} min="05:00" max="23:59" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
            <textarea name="note" value={manualFormData.note} onChange={handleManualChange} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Any special requests..."></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsManualModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">
              Cancel
            </button>
            <button type="submit" disabled={manualSubmitting} className="px-6 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition disabled:opacity-70 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {manualSubmitting ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Portal;
