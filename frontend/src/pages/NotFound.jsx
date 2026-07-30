import { Link } from "react-router-dom";
import "../Styles/ErrorPages.css";

/** 404 — shown for any unmatched route. */
const NotFound = () => {
  return (
    <div className="error-page">
      <div className="error-code">404</div>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;