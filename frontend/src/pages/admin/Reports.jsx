import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import SkeletonLoader from "../../components/SkeletonLoader";
import "../../Styles/Reports.css";

/**
 * Admin sub-page: simple analytics — booking counts by status,
 * most-booked resources, and busiest resource types. All computed
 * client-side from the bookings table (fine at this project's
 * scale; a larger system would push this into a SQL view).
 */
const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [statusCounts, setStatusCounts] = useState({});
  const [topResources, setTopResources] = useState([]);
  const [typeCounts, setTypeCounts] = useState({});

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      const { data: bookings } = await supabase
        .from("bookings")
        .select("status, resource_id, resources(name, type)");

      if (bookings) {
        const statuses = {};
        const resourceCounts = {};
        const types = {};

        bookings.forEach((b) => {
          statuses[b.status] = (statuses[b.status] || 0) + 1;

          const name = b.resources?.name || "Unknown";
          resourceCounts[name] = (resourceCounts[name] || 0) + 1;

          const type = b.resources?.type || "Unknown";
          types[type] = (types[type] || 0) + 1;
        });

        setStatusCounts(statuses);
        setTypeCounts(types);
        setTopResources(
          Object.entries(resourceCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
        );
      }

      setLoading(false);
    };

    loadReports();
  }, []);

  const maxResourceCount = topResources.length ? topResources[0][1] : 1;
  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

  if (loading) {
    return (
      <div className="reports-page">
        <SkeletonLoader type="card" count={3} />
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="report-panel">
        <h3>Bookings by Status</h3>
        <div className="status-bars">
          {["pending", "approved", "rejected", "cancelled"].map((status) => {
            const count = statusCounts[status] || 0;
            const pct = Math.round((count / totalStatusCount) * 100);
            return (
              <div className="status-bar-row" key={status}>
                <span className="status-bar-label">{status}</span>
                <div className="status-bar-track">
                  <div
                    className={`status-bar-fill status-${status}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="status-bar-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="report-panel">
        <h3>Most Booked Resources</h3>
        {topResources.length === 0 ? (
          <p className="report-empty">No booking data yet.</p>
        ) : (
          <div className="top-resources-list">
            {topResources.map(([name, count]) => (
              <div className="top-resource-row" key={name}>
                <span className="top-resource-name">{name}</span>
                <div className="top-resource-track">
                  <div
                    className="top-resource-fill"
                    style={{ width: `${(count / maxResourceCount) * 100}%` }}
                  />
                </div>
                <span className="top-resource-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="report-panel">
        <h3>Bookings by Resource Type</h3>
        <div className="type-chips">
          {Object.entries(typeCounts).map(([type, count]) => (
            <div className="type-chip" key={type}>
              <span>{type}</span>
              <span className="type-chip-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;