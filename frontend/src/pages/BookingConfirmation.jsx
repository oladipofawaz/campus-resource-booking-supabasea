import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import SkeletonLoader from "../components/SkeletonLoader";
import "../Styles/BookingConfirmation.css";

/**
 * Booking confirmation page — shown for an approved booking.
 * Includes a QR code placeholder (a real implementation would
 * generate one from the booking ID for physical check-in scanning).
 */
const BookingConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, resources(name, type, location)")
        .eq("id", id)
        .single();
      setBooking(data);
      setLoading(false);
    };
    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="confirmation-page">
        <SkeletonLoader type="card" count={1} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="confirmation-page">
        <p className="page-status">Booking not found.</p>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-check">✓</div>
        <h1>Booking Confirmed</h1>
        <p className="confirmation-subtext">
          Your booking has been approved. Show this confirmation at check-in.
        </p>

        <div className="qr-placeholder">
          <div className="qr-placeholder-inner">
            <span>QR</span>
          </div>
          <p className="qr-caption">QR Code (booking ref: {booking.id.slice(0, 8)})</p>
        </div>

        <div className="confirmation-details">
          <div className="confirmation-row">
            <span className="confirmation-label">Resource</span>
            <span className="confirmation-value">{booking.resources?.name}</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-label">Location</span>
            <span className="confirmation-value">{booking.resources?.location}</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-label">Date</span>
            <span className="confirmation-value">{booking.date}</span>
          </div>
          <div className="confirmation-row">
            <span className="confirmation-label">Time</span>
            <span className="confirmation-value">
              {booking.start_time} - {booking.end_time}
            </span>
          </div>
          {booking.purpose && (
            <div className="confirmation-row">
              <span className="confirmation-label">Purpose</span>
              <span className="confirmation-value">{booking.purpose}</span>
            </div>
          )}
        </div>

        <button className="btn-secondary" onClick={() => navigate("/my-bookings")}>
          Back to My Bookings
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;