/**
 * Generic skeleton loading placeholder.
 * Usage: <SkeletonLoader type="card" count={3} /> or type="row" / "text"
 */
import "../Styles/SkeletonLoader.css";
const SkeletonLoader = ({ type = "card", count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-${type}`} />
      ))}
    </>
  );
};

export default SkeletonLoader;