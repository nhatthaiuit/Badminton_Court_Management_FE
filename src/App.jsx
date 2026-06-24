import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

// Pages
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import NotFound from "./pages/NotFound/NotFound";

import Bookings from "./pages/Bookings/Bookings";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside MainLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/bookings" element={<Bookings />} />
              
              {/* Admin/Owner only routes */}
              <Route element={<ProtectedRoute requiredRoles={["admin", "owner"]} />}>
                <Route path="/courts" element={<div className="p-4">Courts Page (Coming Soon)</div>} />
              </Route>

              {/* Admin only routes */}
              <Route element={<ProtectedRoute requiredRoles={["admin"]} />}>
                <Route path="/users" element={<div className="p-4">Users Page (Coming Soon)</div>} />
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
