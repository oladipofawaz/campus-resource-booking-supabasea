import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import "../Styles/MyBookings.css";

const FILTERS = ["All", "pending", "approved", "rejected", "cancelled"];

/**
 * My Bookings page — full history of the logged-in user's bookings,
 * with status filter tabs and the ability to cancel a pending or
 * approved booking (handled via the RLS policy added in
 * 002_cancellation_support.sql).
 */
const MyBookings = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, resources(name, type, location)")
      .eq("user_id", user.id)
      .order("date", { ascending: false });
    if (!error) setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered =
    activeFilter === "All" ? bookings : bookings.filter((b) => b.status === activeFilter);

  const handleCancel = async () => {
  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", cancelTarget.id);
  

    setCancelTarget(null);

    if (error) {
      showToast("Could not cancel booking", "error");
      return;
    }

    showToast("Booking cancelled", "success");
    fetchBookings();
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Track the status of everything you've booked.</p>
      </div>

      <div className="bookings-filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`filter-tab ${activeFilter === f ? "active" : ""}`}
            onClick={() => setActiveFilter(f)}
          >
            {f === "All" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonLoader type="row" count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="📭"
          title="No bookings here"
          message="You don't have any bookings matching this filter."
          actionLabel="Browse Resources"
          onAction={() => navigate("/resources")}
        />
      ) : (
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Date</th>
                <th>Time</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <button
                      className="resource-link"
                      onClick={() => navigate(`/resources/${b.resource_id}`)}
                    >
                      {b.resources?.name}
                    </button>
                  </td>
                  <td>{b.date}</td>
                  <td>
                    {b.start_time} - {b.end_time}
                  </td>
                  <td>{b.purpose || "—"}</td>
                  <td>
                    <span className={`status-pill status-${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {(b.status === "pending" || b.status === "approved") && (
                      <button className="cancel-btn" onClick={() => setCancelTarget(b)}>
                        Cancel
                      </button>
                    )}
                    {b.status === "approved" && (
                      <button
                        className="view-confirmation-btn"
                        onClick={() => navigate(`/booking-confirmation/${b.id}`)}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel this booking?"
          message={`This will cancel your booking for ${cancelTarget.resources?.name} on ${cancelTarget.date}. This can't be undone.`}
          confirmLabel="Cancel Booking"
          danger
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
};

export default MyBookings;