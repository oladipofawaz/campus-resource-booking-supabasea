import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import ResourceCard from "../components/ResourceCard";
import BookingModal from "../components/BookingModal";
import SkeletonLoader from "../components/SkeletonLoader";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import "../Styles/Resources.css";

const PAGE_SIZE = 6;

/**
 * Resources page — browse, search, and filter all bookable
 * campus resources, with pagination and a booking modal.
 */
const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeType, setActiveType] = useState("All");
  const [page, setPage] = useState(1);
  const [bookingTarget, setBookingTarget] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setResources(data);
      setLoading(false);
    };
    fetchResources();
  }, []);

  // Unique resource types, used to render filter chips
  const types = useMemo(() => {
    const unique = new Set(resources.map((r) => r.type));
    return ["All", ...unique];
  }, [resources]);

  // Apply search + type filter
  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesType = activeType === "All" || r.type === activeType;
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [resources, activeType, searchTerm]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 whenever filters change so you don't get stuck on an empty page
  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeType]);

  return (
    <div className="resources-page">
      <div className="resources-header">
        <h1>Available Resources</h1>
        <p>Find and book labs, rooms, courts, and equipment across campus.</p>
      </div>

      <div className="resources-toolbar">
        <input
          type="text"
          className="resources-search"
          placeholder="Search by name or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="resources-filter-chips">
          {types.map((t) => (
            <button
              key={t}
              className={`filter-chip ${activeType === t ? "active" : ""}`}
              onClick={() => setActiveType(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="resources-grid">
          <SkeletonLoader type="card" count={6} />
        </div>
      ) : paginated.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No resources found"
          message="Try adjusting your search or filter."
        />
      ) : (
        <>
          <div className="resources-grid">
            {paginated.map((r) => (
              <ResourceCard key={r.id} resource={r} onBookClick={setBookingTarget} />
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {bookingTarget && (
        <BookingModal resource={bookingTarget} onClose={() => setBookingTarget(null)} />
      )}
    </div>
  );
};

export default Resources;