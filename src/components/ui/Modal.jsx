import { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
  const panelRef = useRef(null);
  const startYRef = useRef(null);
  const currentYRef = useRef(0);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Touch drag to dismiss (mobile bottom sheet)
  const handleTouchStart = useCallback((e) => {
    // Only handle touch on the header area
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = 0;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startYRef.current === null) return;
    const deltaY = e.touches[0].clientY - startYRef.current;
    // Only allow dragging down (positive deltaY)
    if (deltaY > 0 && panelRef.current) {
      currentYRef.current = deltaY;
      panelRef.current.style.transform = `translateY(${deltaY}px)`;
      panelRef.current.style.transition = "none";
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (panelRef.current) {
      panelRef.current.style.transition = "transform 0.3s ease-out";
      // If dragged more than 100px down, close
      if (currentYRef.current > 100) {
        panelRef.current.style.transform = "translateY(100%)";
        setTimeout(onClose, 200);
      } else {
        panelRef.current.style.transform = "translateY(0)";
      }
    }
    startYRef.current = null;
    currentYRef.current = 0;
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal Panel */}
      <div 
        ref={panelRef}
        className={`relative w-full ${maxWidth} bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[90vh] animate-slide-up sm:animate-fade-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header with drag handle */}
        <div 
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex-shrink-0 cursor-grab active:cursor-grabbing sm:cursor-default"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag handle for mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full sm:hidden"></div>
          <h3 id="modal-title" className="text-base sm:text-lg font-bold text-gray-900 mt-1 sm:mt-0 truncate pr-4">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 -mr-1"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar pb-safe overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
