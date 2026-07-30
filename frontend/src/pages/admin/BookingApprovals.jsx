import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useToast } from "../../context/ToastContext";
import SkeletonLoader from "../../components/SkeletonLoader";
import EmptyState from "../../components/EmptyState";
import "../../Styles/BookingApprovals.css";

const FILTERS = ["pending", "approved", "rejected", "cancelled", "All"];

/**
 * Admin sub-page: review, approve, or reject every booking request
 * across campus. Defaults to showing "pending" since that's the
 * actionable queue.
 */
const BookingApprovals = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("pending");
  const [actingOn, setActingOn] = useState(null); // booking id currently being updated

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*, resources(name, location), profiles(name, email)")
      .order("created_at", { ascending: false });
    if (!error) setBookings(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filtered =
    activeFilter === "All" ? bookings : bookings.filter((b) => b.status === activeFilter);

  const handleDecision = async (id, status) => {
    setActingOn(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    setActingOn(null);

    if (error) {
      showToast("Something went wrong", "error");
      return;
    }

    showToast(`Booking ${status}`, status === "approved" ? "success" : "info");
    fetchBookings();
  };

  return (
    <div className="approvals-page">
      <div className="approvals-filter-tabs">
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
        <EmptyState icon="✅" title="Nothing here" message="No bookings match this filter." />
      ) : (
        <div className="approvals-table-wrapper">
          <table className="approvals-table">
            <thead>
              <tr>
                <th>Student</th>
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
                    <div className="student-cell">
                      <span className="student-name">{b.profiles?.name}</span>
                      <span className="student-email">{b.profiles?.email}</span>
                    </div>
                  </td>
                  <td>{b.resources?.name}</td>
                  <td>{b.date}</td>
                  <td>
                    {b.start_time} - {b.end_time}
                  </td>
                  <td>{b.purpose || "—"}</td>
                  <td>
                    <span className={`status-pill status-${b.status}`}>{b.status}</span>
                  </td>
                  <td className="action-cell">
                    {b.status === "pending" ? (
                      <>
                        <button
                          className="btn-approve"
                          disabled={actingOn === b.id}
                          onClick={() => handleDecision(b.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-reject"
                          disabled={actingOn === b.id}
                          onClick={() => handleDecision(b.id, "rejected")}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="no-action">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BookingApprovals;