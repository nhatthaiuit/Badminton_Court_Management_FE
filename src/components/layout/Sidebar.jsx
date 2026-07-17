import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Map, 
  Users,
  LogOut 
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Court Schedule", path: "/bookings", icon: CalendarDays },
    { name: "Statistics", path: "/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users, roles: ["admin", "owner", "staff"] },
    { name: "Courts", path: "/courts", icon: Map, roles: ["admin", "owner"] },
  ];

  return (
    <aside className="w-64 bg-[#1e293b] text-white flex flex-col h-screen fixed left-0 top-0 hidden md:flex z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-gray-800 font-bold tracking-wider">
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-full p-1 shadow-sm">
            <img src="/logo2.png" alt="BCMS Logo" className="h-12 w-12 object-contain" />
          </div>
          <span className="text-2xl text-blue-400">BCMS</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
        {navItems.map((item) => {
          // Hide items user doesn't have role for
          if (item.roles && !item.roles.includes(user?.role)) return null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Area */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5 text-red-400" />
          Logout
        </button>
        <div className="mt-4 text-xs text-gray-500 text-center">
          BCMS Admin v1.0
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
