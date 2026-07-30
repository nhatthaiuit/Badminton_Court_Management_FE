import { Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ title, onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-gray-300 flex items-center justify-between px-4 sm:px-8 z-10 shadow-sm sticky top-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 text-gray-500 hover:text-blue-600 transition">
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-6">

        <div className="flex items-center space-x-3 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-300">
          <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center font-bold shadow-sm">
             {user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="text-sm">
            <p className="font-bold text-gray-800">{user?.full_name || 'User'}</p>
            <p className="text-gray-500 text-xs font-medium capitalize">{user?.role || 'Staff'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
