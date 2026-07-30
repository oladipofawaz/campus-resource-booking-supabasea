import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "../Styles/TopBar.css";

/**
 * Top navigation bar: mobile menu toggle, search, theme switch,
 * and user menu (name + logout). Sits above the page content in
 * DashboardLayout, to the right of the Sidebar.
 */
const Topbar = ({ onMenuClick }) => {
  const { profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <div className="topbar-search">
          <input type="text" placeholder="Search everywhere..." />
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="topbar-theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <div className="topbar-user">
          <div className="topbar-avatar">{profile?.name?.[0]?.toUpperCase() || "?"}</div>
          <span className="topbar-username">{profile?.name}</span>
        </div>

        <button className="topbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;