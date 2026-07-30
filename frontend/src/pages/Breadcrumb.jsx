import { Link, useLocation } from "react-router-dom";
import "../Styles/Breadcrumb.css";

// Maps route segments to readable labels
const LABELS = {
  dashboard: "Dashboard",
  resources: "Resources",
  "my-bookings": "My Bookings",
  "booking-confirmation": "Booking Confirmation",
  profile: "Profile",
  admin: "Admin",
  bookings: "Booking Requests",
  users: "Users",
  reports: "Reports",
  settings: "Settings",
};

/**
 * Auto-generates breadcrumb trail from the current URL path.
 * Dynamic segments (ids) are shown as "Details" rather than the raw id.
 */
const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null; // no breadcrumb needed on top-level pages

  let pathAccumulator = "";

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard" className="breadcrumb-link">
        Home
      </Link>
      {segments.map((seg, i) => {
        pathAccumulator += `/${seg}`;
        const isLast = i === segments.length - 1;
        const isIdLike = /^[0-9a-f-]{8,}$/i.test(seg); // looks like a uuid
        const label = isIdLike ? "Details" : LABELS[seg] || seg;

        return (
          <span key={pathAccumulator} className="breadcrumb-segment">
            <span className="breadcrumb-separator">/</span>
            {isLast ? (
              <span className="breadcrumb-current">{label}</span>
            ) : (
              <Link to={pathAccumulator} className="breadcrumb-link">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;