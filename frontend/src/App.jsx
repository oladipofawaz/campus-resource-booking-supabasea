import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";

// Auth pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main app pages
import Dashboard from "./pages/Dashboard";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import MyBookings from "./pages/MyBookings";
import BookingConfirmation from "./pages/BookingConfirmation";
import Profile from "./pages/Profile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import BookingApprovals from "./pages/admin/BookingApprovals";
import ManageResources from "./pages/admin/ManageResources";
import ManageUsers from "./pages/admin/ManageUsers";
import Reports from "./pages/admin/Reports";
import SystemSettings from "./pages/admin/SystemSettings";

// Error pages
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Public auth routes — no sidebar/topbar shell */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Authenticated app — wrapped in DashboardLayout (sidebar/topbar/breadcrumb) */}
      <Route
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin-only nested routes — role check happens in PrivateRoute below */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          <Route path="bookings" element={<BookingApprovals />} />
          <Route path="resources" element={<ManageResources />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Route>

      {/* Redirect root to dashboard (PrivateRoute will bounce to /login if not authed) */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;