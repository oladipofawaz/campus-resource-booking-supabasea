import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/Navbar.css";


const Navbar = () => {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        Campus Resource Booking
      </Link>
      <div className="navbar-links">
        {session ? (
          <>
            <Link to="/">Resources</Link>
            <Link to="/my-bookings">My Bookings</Link>
            {profile?.role === "admin" && <Link to="/admin">Admin</Link>}
            <span className="navbar-user">Hi, {profile?.name}</span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
