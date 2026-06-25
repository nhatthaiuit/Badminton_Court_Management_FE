import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const MainLayout = () => {
  const location = useLocation();
  
  // Map routes to header titles
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard": return "Overview Dashboard";
      case "/bookings": return "Court Bookings";
      case "/courts": return "Court Management";
      case "/users": return "User Management";
      default: return "Badminton Court Management";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 flex flex-col min-w-0">
        <Header title={getPageTitle()} />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
