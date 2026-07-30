import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import BookingModal from "../components/BookingModal";
import SkeletonLoader from "../components/SkeletonLoader";
import "../Styles/ResourceDetail.css";

/**
 * Full detail view for a single resource, reached by clicking a
 * ResourceCard. Shows description, capacity, and upcoming approved
 * bookings so students can judge real availability at a glance.
 */
const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resource, setResource] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadData = async () => {
    setLoading(true);

    const { data: resourceData } = await supabase
      .from("resources")
      .select("*")
      .eq("id", id)
      .single();

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("date, start_time, end_time, status")
      .eq("resource_id", id)
      .eq("status", "approved")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true });

    setResource(resourceData);
    setUpcomingBookings(bookingsData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="resource-detail-page">
        <SkeletonLoader type="text" count={2} />
        <SkeletonLoader type="card" count={1} />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="resource-detail-page">
        <p className="page-status">Resource not found.</p>
        <button className="btn-secondary" onClick={() => navigate("/resources")}>
          Back to Resources
        </button>
      </div>
    );
  }

  return (
    <div className="resource-detail-page">
      <button className="back-link" onClick={() => navigate("/resources")}>
        ← Back to Resources
      </button>

      <div className="resource-detail-card">
        <div className="resource-detail-header">
          <div>
            <span className="resource-detail-type">{resource.type}</span>
            <h1>{resource.name}</h1>
            <p className="resource-detail-location">📍 {resource.location}</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            Book This Resource
          </button>
        </div>

        <div className="resource-detail-meta">
          <div className="meta-item">
            <span className="meta-label">Capacity</span>
            <span className="meta-value">{resource.capacity} people</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Status</span>
            <span className="meta-value status-available">Available</span>
          </div>
        </div>

        {resource.description && (
          <div className="resource-detail-section">
            <h3>Description</h3>
            <p>{resource.description}</p>
          </div>
        )}

        <div className="resource-detail-section">
          <h3>Upcoming Approved Bookings</h3>
          {upcomingBookings.length === 0 ? (
            <p className="no-bookings-text">No upcoming bookings — fully open right now.</p>
          ) : (
            <ul className="upcoming-bookings-list">
              {upcomingBookings.map((b, i) => (
                <li key={i}>
                  <strong>{b.date}</strong> · {b.start_time} - {b.end_time}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showModal && (
        <BookingModal
          resource={resource}
          onClose={() => setShowModal(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default ResourceDetail;