import { Link } from "react-router-dom";
import "../Styles/ErrorPages.css";

/**
 * Generic error page — shown when a React error boundary catches
 * an unexpected runtime error (see ErrorBoundary component).
 */
const ErrorPage = ({ message }) => {
  return (
    <div className="error-page">
      <div className="error-code">⚠️</div>
      <h1>Something went wrong</h1>
      <p>{message || "An unexpected error occurred. Please try refreshing the page."}</p>
      <Link to="/dashboard" className="btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default ErrorPage;