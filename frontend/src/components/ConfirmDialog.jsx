import "../Styles/ConfirmDialog.css";

/**
 * Generic confirmation dialog — used before destructive actions
 * like cancelling a booking or deleting a resource.
 * Usage: <ConfirmDialog title="..." message="..." onConfirm={fn} onCancel={fn} />
 */
const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={danger ? "btn-danger" : "btn-primary"}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;