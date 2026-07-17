import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors hidden md:block"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="hidden md:flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
              >
                <UserIcon className="h-4 w-4" />
                Sign In
              </NavLink>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4 space-y-2">
              <NavLink 
                to="/portal" 
                end
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50'}`}
              >
                Book Court
              </NavLink>
              <NavLink 
                to="/portal/my-bookings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'text-gray-600 font-medium hover:bg-gray-50'}`}
              >
                My Bookings
              </NavLink>
              
              {!user && (
                <NavLink
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 mt-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition"
                >
                  <UserIcon className="h-4 w-4" />
                  Sign In
                </NavLink>
              )}
              
              {user && (
                <button
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 mt-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
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
