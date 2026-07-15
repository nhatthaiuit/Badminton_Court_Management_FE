import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";
import CustomerLayout from "./components/layout/CustomerLayout";

// Pages
import Login from "./pages/Auth/Login";
import ResetPassword from "./pages/Auth/ResetPassword";
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound/NotFound";
import Bookings from "./pages/Bookings/Bookings";
import Courts from "./pages/Courts/Courts";
import Users from "./pages/Users/Users";
import Portal from "./pages/CustomerPortal/Portal";
import MyBookings from "./pages/CustomerPortal/MyBookings";
import Payment from "./pages/CustomerPortal/Payment";

import { useAuth } from "./hooks/useAuth";

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "admin" || user?.role === "owner") {
    return <Navigate to="/dashboard" replace />;
  } else if (user?.role === "customer") {
    return <Navigate to="/portal" replace />;
  }
  return <Navigate to="/bookings" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Customer Portal Routes */}
          <Route element={<ProtectedRoute requiredRoles={["customer"]} />}>
            <Route element={<CustomerLayout />}>
              <Route path="/portal" element={<Portal />} />
              <Route path="/portal/my-bookings" element={<MyBookings />} />
              <Route path="/portal/payment/:bookingId" element={<Payment />} />
            </Route>
          </Route>

          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes inside MainLayout (Staff/Admin/Owner) */}
          <Route element={<ProtectedRoute requiredRoles={["staff", "admin", "owner"]} />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              
              {/* Admin/Owner only routes */}
              <Route element={<ProtectedRoute requiredRoles={["admin", "owner"]} />}>
                <Route path="/courts" element={<Courts />} />
              </Route>

              {/* Admin only routes */}
              <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
                <Route path="/users" element={<Users />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
