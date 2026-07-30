/**
 * Reusable empty state — shown when a list has no data yet.
 * Usage: <EmptyState icon="📭" title="No bookings yet" message="..." actionLabel="Book Now" onAction={fn} />
 */
import"../Styles/EmptyState.css"
const EmptyState = ({ icon = "📭", title, message, actionLabel, onAction }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {message && <p className="empty-state-message">{message}</p>}
      {actionLabel && onAction && (
        <button className="empty-state-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;