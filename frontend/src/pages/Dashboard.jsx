import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import "../Styles/Dashboard.css";

/**
 * Main landing page after login. Shows quick stats, recent bookings,
 * and quick-action shortcuts. Admins see slightly different stats
 * (pending approvals) than students (their own booking counts).
 */
const Dashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "admin";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, resources: 0 });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);

      // Base query differs for admin (sees all) vs student (sees own)
      let bookingsQuery = supabase
        .from("bookings")
        .select("*, resources(name, type)")
        .order("created_at", { ascending: false });

      if (!isAdmin) {
        bookingsQuery = bookingsQuery.eq("user_id", user.id);
      }

      const { data: bookings } = await bookingsQuery;
      const { count: resourceCount } = await supabase
        .from("resources")
        .select("*", { count: "exact", head: true });

      if (bookings) {
        setStats({
          total: bookings.length,
          pending: bookings.filter((b) => b.status === "pending").length,
          approved: bookings.filter((b) => b.status === "approved").length,
          resources: resourceCount || 0,
        });
        setRecentBookings(bookings.slice(0, 5));
      }

      setLoading(false);
    };

    if (user) loadDashboard();
  }, [user, isAdmin]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>Welcome back, {profile?.name?.split(" ")[0]} 👋</h1>
        <p>
          {isAdmin
            ? "Here's an overview of booking activity across campus."
            : "Here's a quick look at your bookings."}
        </p>
      </div>

      {/* Stats cards */}
      <div className="dashboard-stats-grid">
        {loading ? (
          <SkeletonLoader type="card" count={4} />
        ) : (
          <>
            <StatCard
              label={isAdmin ? "Total Bookings" : "My Bookings"}
              value={stats.total}
              icon="📅"
              accent="primary"
            />
            <StatCard
              label="Pending Approval"
              value={stats.pending}
              icon="⏳"
              accent="warning"
            />
            <StatCard label="Approved" value={stats.approved} icon="✅" accent="success" />
            <StatCard label="Available Resources" value={stats.resources} icon="🏢" accent="primary" />
          </>
        )}
      </div>

      <div className="dashboard-grid">
        {/* Recent bookings */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Recent Bookings</h2>
            <button className="link-btn" onClick={() => navigate("/my-bookings")}>
              View all
            </button>
          </div>

          {loading ? (
            <SkeletonLoader type="row" count={4} />
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon="📭"
              title="No bookings yet"
              message="Browse available resources and make your first booking."
              actionLabel="Browse Resources"
              onAction={() => navigate("/resources")}
            />
          ) : (
            <ul className="recent-bookings-list">
              {recentBookings.map((b) => (
                <li key={b.id} className="recent-booking-item">
                  <div>
                    <p className="recent-booking-resource">{b.resources?.name}</p>
                    <p className="recent-booking-meta">
                      {b.date} · {b.start_time} - {b.end_time}
                    </p>
                  </div>
                  <span className={`status-pill status-${b.status}`}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick actions */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate("/resources")}>
              <span className="quick-action-icon">🏢</span>
              Book a Resource
            </button>
            <button className="quick-action-btn" onClick={() => navigate("/my-bookings")}>
              <span className="quick-action-icon">📅</span>
              View My Bookings
            </button>
            <button className="quick-action-btn" onClick={() => navigate("/profile")}>
              <span className="quick-action-icon">👤</span>
              Edit Profile
            </button>
            {isAdmin && (
              <button className="quick-action-btn" onClick={() => navigate("/admin")}>
                <span className="quick-action-icon">🛠️</span>
                Go to Admin Panel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;