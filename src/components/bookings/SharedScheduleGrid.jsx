import { useState, useEffect, useRef, useCallback } from "react";
import { AlertCircle, Wrench } from "lucide-react";
import dayjs from "dayjs";

// Responsive hour widths
const HOUR_WIDTH_DESKTOP = 112;
const HOUR_WIDTH_MOBILE = 72;
const COURT_COL_DESKTOP = 128; // w-32
const COURT_COL_MOBILE = 72;   // w-18

// Start at 05:00, end at 23:30 (slots up to 23:00 column)
const START_HOUR = 5;
const END_HOUR = 23;
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR);

const SharedScheduleGrid = ({
  courts = [],
  bookings = [],
  loading = false,
  role = "customer", // "customer", "staff", "admin", "owner"
  selectedDate = dayjs().format("YYYY-MM-DD"),
  onSlotSelect = () => {},
  onBookingClick = () => {},
}) => {
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionCurrent, setSelectionCurrent] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const HOUR_WIDTH = isMobile ? HOUR_WIDTH_MOBILE : HOUR_WIDTH_DESKTOP;
  const COURT_COL_WIDTH = isMobile ? COURT_COL_MOBILE : COURT_COL_DESKTOP;

  // Auto-scroll to current hour on mount
  useEffect(() => {
    if (scrollContainerRef.current && selectedDate === dayjs().format("YYYY-MM-DD")) {
      const currentHour = dayjs().hour();
      const scrollTo = Math.max(0, (currentHour - START_HOUR - 1) * HOUR_WIDTH);
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({ left: scrollTo, behavior: "smooth" });
      }, 300);
    }
  }, [selectedDate, HOUR_WIDTH, courts.length]);

  // Mouse drag selection
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (selectionStart && selectionCurrent) {
        const minHour = Math.min(selectionStart.hour, selectionCurrent.hour);
        const maxHour = Math.max(selectionStart.hour, selectionCurrent.hour);
        const startTime = `${minHour.toString().padStart(2, "0")}:00`;
        let endH = maxHour + 1;
        let endTime = `${endH.toString().padStart(2, "0")}:00`;

        const court = courts.find(c => c.court_id === selectionStart.courtId);
        if (court) {
          onSlotSelect(court, startTime, endTime);
        }
      }
      setSelectionStart(null);
      setSelectionCurrent(null);
    };

    if (selectionStart) {
      window.addEventListener("mouseup", handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [selectionStart, selectionCurrent, courts, onSlotSelect]);

  // Touch handling for mobile tap-to-select
  const handleTouchStart = useCallback((courtId, hour, isPast) => {
    if (isPast) return;
    // On touch, treat as single slot selection (tap = 1 hour)
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    const court = courts.find(c => c.court_id === courtId);
    if (court) {
      onSlotSelect(court, startTime, endTime);
    }
  }, [courts, onSlotSelect]);

  const handleMouseDown = (courtId, hour) => {
    setSelectionStart({ courtId, hour });
    setSelectionCurrent({ courtId, hour });
  };

  const handleMouseEnter = (courtId, hour) => {
    if (selectionStart && selectionStart.courtId === courtId) {
      setSelectionCurrent({ courtId, hour });
    }
  };

  const getPositionStyles = (startTime, endTime) => {
    const startObj = dayjs(`2000-01-01 ${startTime}`, "YYYY-MM-DD HH:mm:ss");
    const endObj = dayjs(`2000-01-01 ${endTime}`, "YYYY-MM-DD HH:mm:ss");
    
    // Base is START_HOUR:00:00
    const baseObj = dayjs(`2000-01-01 ${START_HOUR.toString().padStart(2, '0')}:00:00`, "YYYY-MM-DD HH:mm:ss");
    const startMinutes = startObj.diff(baseObj, "minute");
    const durationMinutes = endObj.diff(startObj, "minute");
    const pixelsPerMinute = HOUR_WIDTH / 60;

    return {
      left: `${startMinutes * pixelsPerMinute}px`,
      width: `${durationMinutes * pixelsPerMinute}px`,
    };
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (courts.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center text-gray-500">
        No courts available.
      </div>
    );
  }

  return (
    <div ref={scrollContainerRef} className="flex-1 overflow-auto relative custom-scrollbar">
      <div className="min-w-max">
        {/* Header Timeline */}
        <div className="flex border-b border-gray-300 sticky top-0 z-10 bg-gray-50 shadow-sm">
          <div 
            className="flex-shrink-0 border-r border-gray-300 p-2 sm:p-3 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-20 text-xs sm:text-sm"
            style={{ width: `${COURT_COL_WIDTH}px` }}
          >
            Courts
          </div>
          <div className="flex flex-1">
            {HOURS.map((hour, hIdx) => (
              <div
                key={hour}
                className={`flex-shrink-0 text-center py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-500 border-gray-300 ${hIdx === HOURS.length - 1 ? '' : 'border-r'}`}
                style={{ width: `${HOUR_WIDTH}px` }}
              >
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
        </div>

        {/* Court Rows */}
        <div className="relative">
          {courts.map((court, cIdx) => {
            const courtBookings = bookings.filter(b => b.court_id === court.court_id && b.status !== 'cancelled');
            const isLastRow = cIdx === courts.length - 1;
            
            return (
              <div key={court.court_id} className="flex group hover:bg-gray-50 transition-colors">
                <div 
                  className={`flex-shrink-0 border-r border-gray-300 p-2 sm:p-4 bg-white group-hover:bg-gray-50 sticky left-0 z-20 font-medium text-gray-800 text-xs sm:text-sm flex items-center ${isLastRow ? '' : 'border-b'}`}
                  style={{ width: `${COURT_COL_WIDTH}px` }}
                >
                  <span className="truncate">{court.name}</span>
                </div>
                
                <div className={`flex-1 relative h-12 sm:h-16 cursor-crosshair border-gray-300 ${isLastRow ? '' : 'border-b'}`}>
                  {/* Background hour columns (clickable for empty slots) */}
                  {HOURS.map((hour, idx) => {
                    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                    
                    // Check if slot is in the past (only for today)
                    const isPast = selectedDate === dayjs().format("YYYY-MM-DD") && timeStr < dayjs().format("HH:mm");

                    return (
                      <div
                        key={`bg-${hour}`}
                        onMouseDown={() => !isPast && !isMobile && handleMouseDown(court.court_id, hour)}
                        onMouseEnter={() => !isPast && !isMobile && handleMouseEnter(court.court_id, hour)}
                        onTouchEnd={(e) => {
                          if (!isPast && isMobile) {
                            e.preventDefault();
                            handleTouchStart(court.court_id, hour, isPast);
                          }
                        }}
                        className={`absolute top-0 bottom-0 border-gray-300 transition-colors ${idx === HOURS.length - 1 ? '' : 'border-r'} ${
                          isPast 
                            ? 'bg-gray-50 cursor-not-allowed bg-pattern-diagonal' 
                            : 'hover:bg-primary-50 cursor-crosshair active:bg-primary-100'
                        }`}
                        style={{ 
                          left: `${idx * HOUR_WIDTH}px`,
                          width: `${HOUR_WIDTH}px`
                        }}
                      ></div>
                    );
                  })}

                  {/* If entire court is inactive */}
                  {court.status === "inactive" ? (
                    <div className="absolute inset-y-1 inset-x-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 font-medium z-10 cursor-not-allowed text-xs sm:text-sm">
                      Court Inactive
                    </div>
                  ) : court.status === "maintenance" ? (
                    <div className="absolute inset-y-1 inset-x-2 bg-gray-100 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500 font-medium z-10 cursor-not-allowed text-xs sm:text-sm">
                      Court Under Maintenance
                    </div>
                  ) : (
                    <>
                      {/* Render Bookings & Time-based Maintenance */}
                      {courtBookings.map((booking) => {
                        const styles = getPositionStyles(booking.start_time, booking.end_time);
                        const isMaintenance = booking.customer_name === "Maintenance Block" || booking.note?.includes("[MAINTENANCE]");
                        
                        // Role-based visibility
                        const isCustomer = role === "customer";
                        
                        if (isMaintenance) {
                          return (
                            <div
                              key={booking.booking_id}
                              onClick={() => !isCustomer && onBookingClick(booking)}
                              className={`absolute top-0 bottom-0 bg-gray-200 border border-gray-400 text-gray-600 px-1 sm:px-2 py-1 overflow-hidden z-10 hover:brightness-95 transition flex items-center justify-center ${!isCustomer ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                              style={styles}
                              title={`Maintenance: ${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)}`}
                            >
                              <div className="text-[10px] sm:text-xs font-bold truncate flex items-center gap-1">
                                <Wrench className="h-3 w-3 flex-shrink-0" />
                                <span className="hidden sm:inline">Maintenance</span>
                              </div>
                            </div>
                          );
                        }
                        
                        // Normal Booking Check
                        const now = dayjs();
                        const bookingStart = dayjs(`${booking.booking_date} ${booking.start_time}`);
                        const isCloseToStart = bookingStart.diff(now, 'minute') <= 60 && bookingStart.diff(now, 'minute') > -60;
                        const needsAction = !isCustomer && booking.status === 'pending' && isCloseToStart && booking.booking_date === dayjs().format("YYYY-MM-DD");

                        let bgClass = "bg-yellow-100 border-yellow-300 text-yellow-800"; // pending
                        if (booking.status === 'confirmed') {
                          bgClass = "bg-green-100 border-green-300 text-green-800";
                        } else if (booking.status === 'completed') {
                          bgClass = "bg-blue-100 border-blue-300 text-blue-800 opacity-90";
                        }
                        if (needsAction) {
                          bgClass = "bg-red-50 border-red-400 text-red-800 shadow-sm animate-pulse";
                        }
                        
                        // Mask details for customer
                        if (isCustomer) {
                          bgClass = "bg-red-100 border-red-300 text-red-800 opacity-90 cursor-not-allowed";
                        }

                        return (
                          <div
                            key={booking.booking_id}
                            onClick={() => !isCustomer && onBookingClick(booking)}
                            className={`absolute top-0 bottom-0 border px-1 sm:px-2 py-0.5 sm:py-1 overflow-hidden z-10 hover:brightness-95 transition ${isCustomer ? 'cursor-not-allowed' : 'cursor-pointer'} ${bgClass}`}
                            style={styles}
                            title={isCustomer ? `Booked (${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)})` : `${booking.customer_name} (${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)})`}
                          >
                            <div className="text-[10px] sm:text-xs font-bold truncate flex items-center justify-between">
                              {isCustomer ? "Booked" : booking.customer_name}
                              {needsAction && <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />}
                            </div>
                            {!isCustomer && (
                              <div className="text-[9px] sm:text-[10px] truncate opacity-80">{booking.start_time.slice(0,5)} - {booking.end_time.slice(0,5)}</div>
                            )}
                          </div>
                        );
                      })}

                      {/* Drag Selection Overlay */}
                      {selectionStart && selectionCurrent && selectionStart.courtId === court.court_id && (
                        <div
                          className="absolute top-0 bottom-0 bg-primary-100 border-2 border-primary-400 opacity-60 z-20 pointer-events-none"
                          style={{
                            left: `${(Math.min(selectionStart.hour, selectionCurrent.hour) - START_HOUR) * HOUR_WIDTH}px`,
                            width: `${(Math.abs(selectionStart.hour - selectionCurrent.hour) + 1) * HOUR_WIDTH}px`
                          }}
                        ></div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharedScheduleGrid;
