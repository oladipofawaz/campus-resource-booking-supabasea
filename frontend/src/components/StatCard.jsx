/**
 * Reusable statistics card for dashboards.
 * Usage: <StatCard label="Total Bookings" value={12} icon="📅" trend="+3 this week" />
 */
import "../Styles/Statcard.css";
const StatCard = ({ label, value, icon, trend, accent = "primary" }) => {
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <h3 className="stat-card-value">{value}</h3>
        {trend && <p className="stat-card-trend">{trend}</p>}
      </div>
    </div>
  );
};

export default StatCard;