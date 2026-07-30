import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/Sidebar.css";

/**
 * Responsive sidebar navigation. Collapses to a slide-in drawer
 * on mobile, controlled by the `isOpen`/`onClose` props passed
 * down from DashboardLayout (which owns the toggle state).
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";

  return (
    <>
      {/* Overlay behind the drawer on mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">🏫</span>
          <span className="sidebar-brand-text">CampusBook</span>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Main</p>
          <NavLink to="/dashboard" className="sidebar-link" onClick={onClose}>
            <span className="sidebar-icon">📊</span> Dashboard
          </NavLink>
          <NavLink to="/resources" className="sidebar-link" onClick={onClose}>
            <span className="sidebar-icon">🏢</span> Resources
          </NavLink>
          <NavLink to="/my-bookings" className="sidebar-link" onClick={onClose}>
            <span className="sidebar-icon">📅</span> My Bookings
          </NavLink>
          <NavLink to="/profile" className="sidebar-link" onClick={onClose}>
            <span className="sidebar-icon">👤</span> Profile
          </NavLink>

          {isAdmin && (
            <>
              <p className="sidebar-section-label">Admin</p>
              <NavLink to="/admin" className="sidebar-link" onClick={onClose}>
                <span className="sidebar-icon">🛠️</span> Admin Panel
              </NavLink>
              <NavLink to="/admin/reports" className="sidebar-link" onClick={onClose}>
                <span className="sidebar-icon">📈</span> Reports
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;