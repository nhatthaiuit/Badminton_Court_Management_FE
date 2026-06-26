import { Outlet, NavLink } from "react-router-dom";
import { CalendarDays, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const CustomerLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50/50 flex flex-col font-sans">
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          <div className="flex items-center gap-3 text-primary-600">
            <img src="/logo2.png" alt="BCMS Logo" className="h-12 w-12 object-contain" />
            <span className="font-bold text-xl tracking-wider">BCMS</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <NavLink 
              to="/portal" 
              end
              className={({ isActive }) => `transition-colors ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium hover:text-primary-600'}`}
            >
              Book Court
            </NavLink>
            <NavLink 
              to="/portal/my-bookings" 
              className={({ isActive }) => `transition-colors ${isActive ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium hover:text-primary-600'}`}
            >
              My Bookings
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user.full_name}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                <UserIcon className="h-4 w-4" />
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} BCMS Badminton Court Management. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
