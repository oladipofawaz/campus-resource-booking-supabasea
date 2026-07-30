import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useToast } from "../context/ToastContext";
import "../Styles/BookingModal.css";

/**
 * Reusable booking modal — used from both the Resources grid and
 * the Resource Detail page. Calls the book_resource() Postgres
 * function (see supabase/schema.sql), which atomically checks for
 * time-slot conflicts before inserting.
 */
const BookingModal = ({ resource, onClose, onSuccess }) => {
  const [form, setForm] = useState({ date: "", startTime: "", endTime: "", purpose: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { error } = await supabase.rpc("book_resource", {
      p_resource_id: resource.id,
      p_date: form.date,
      p_start_time: form.startTime,
      p_end_time: form.endTime,
      p_purpose: form.purpose,
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    showToast("Booking request submitted — awaiting approval", "success");
    onSuccess?.();
    onClose();
  };

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>Book {resource.name}</h2>
          <button className="booking-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="booking-modal-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="booking-modal-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                id="startTime"
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endTime">End Time</label>
              <input
                id="endTime"
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose (optional)</label>
            <input
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="e.g. Group study session"
            />
          </div>

          <div className="booking-modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;