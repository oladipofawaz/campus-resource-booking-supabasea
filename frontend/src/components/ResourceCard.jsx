import { useNavigate } from "react-router-dom";
import "../Styles/ResourceCard.css";

/**
 * Card representing a single bookable resource, used in the
 * Resources grid. Clicking it navigates to the detail page.
 */
const ResourceCard = ({ resource, onBookClick }) => {
  const navigate = useNavigate();

  return (
    <div className="resource-card" onClick={() => navigate(`/resources/${resource.id}`)}>
      <div className="resource-card-top">
        <span className="resource-card-type">{resource.type}</span>
        <span className="resource-card-status available">Available</span>
      </div>

      <h3 className="resource-card-name">{resource.name}</h3>
      <p className="resource-card-location">📍 {resource.location}</p>
      <p className="resource-card-capacity">👥 Capacity: {resource.capacity}</p>

      {resource.description && (
        <p className="resource-card-desc">{resource.description}</p>
      )}

      <button
        className="resource-card-book-btn"
        onClick={(e) => {
          e.stopPropagation(); // don't trigger the card's navigate
          onBookClick(resource);
        }}
      >
        Book Now
      </button>
    </div>
  );
};

export default ResourceCard;