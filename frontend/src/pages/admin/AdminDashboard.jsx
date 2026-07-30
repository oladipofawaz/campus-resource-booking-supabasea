import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import StatCard from "../../components/StatCard";
import SkeletonLoader from "../../components/SkeletonLoader";
import "../../Styles/AdminDashboard.css";

/**
 * Admin section shell — tab navigation (Overview, Bookings, Resources,
 * Users, Reports, Settings) with an Outlet for the active sub-page.
 * The Overview stats live directly here since they're the "home" view.
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, resources: 0, pending: 0, totalBookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);

      const [{ count: users }, { count: resources }, { count: pending }, { count: totalBookings }] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("resources").select("*", { count: "exact", head: true }),
          supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
        ]);

      setStats({
        users: users || 0,
        resources: resources || 0,
        pending: pending || 0,
        totalBookings: totalBookings || 0,
      });
      setLoading(false);
    };

    loadStats();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage resources, bookings, users, and view campus-wide activity.</p>
      </div>

      <nav className="admin-tabs">
        <NavLink to="/admin" end className="admin-tab">
          Overview
        </NavLink>
        <NavLink to="/admin/bookings" className="admin-tab">
          Booking Requests
        </NavLink>
        <NavLink to="/admin/resources" className="admin-tab">
          Resources
        </NavLink>
        <NavLink to="/admin/users" className="admin-tab">
          Users
        </NavLink>
        <NavLink to="/admin/reports" className="admin-tab">
          Reports
        </NavLink>
        <NavLink to="/admin/settings" className="admin-tab">
          Settings
        </NavLink>
      </nav>

      {/* Overview content — only meaningful on the exact /admin route.
          Sub-routes render via Outlet below instead. */}
      <div className="admin-overview">
        <div className="admin-stats-grid">
          {loading ? (
            <SkeletonLoader type="card" count={4} />
          ) : (
            <>
              <StatCard label="Total Users" value={stats.users} icon="👥" accent="primary" />
              <StatCard label="Resources" value={stats.resources} icon="🏢" accent="primary" />
              <StatCard
                label="Pending Approvals"
                value={stats.pending}
                icon="⏳"
                accent="warning"
              />
              <StatCard
                label="Total Bookings"
                value={stats.totalBookings}
                icon="📅"
                accent="success"
              />
            </>
          )}
        </div>

        {stats.pending > 0 && (
          <div className="admin-alert">
            <span>
              You have <strong>{stats.pending}</strong> booking request
              {stats.pending > 1 ? "s" : ""} waiting for approval.
            </span>
            <button onClick={() => navigate("/admin/bookings")}>Review Now</button>
          </div>
        )}
      </div>

      <Outlet />
    </div>
  );
};

export default AdminDashboard;