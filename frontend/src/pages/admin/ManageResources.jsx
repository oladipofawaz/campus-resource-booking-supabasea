import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../../components/ConfirmDialog";
import SkeletonLoader from "../../components/SkeletonLoader";
import EmptyState from "../../components/EmptyState";
import "../../Styles/ManageResources.css";

const emptyForm = { id: null, name: "", type: "", location: "", capacity: 1, description: "" };

/**
 * Admin sub-page: full CRUD over resources. Uses one form for both
 * "add new" and "edit existing" — editing pre-fills the form and
 * changes the submit button to "Update Resource".
 */
const ManageResources = () => {
  const { showToast } = useToast();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setResources(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      type: form.type,
      location: form.location,
      capacity: Number(form.capacity),
      description: form.description,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from("resources").update(payload).eq("id", form.id));
    } else {
      ({ error } = await supabase.from("resources").insert([payload]));
    }

    setSaving(false);

    if (error) {
      showToast("Could not save resource", "error");
      return;
    }

    showToast(form.id ? "Resource updated" : "Resource added", "success");
    resetForm();
    fetchResources();
  };

  const handleEditClick = (resource) => {
    setForm({
      id: resource.id,
      name: resource.name,
      type: resource.type,
      location: resource.location,
      capacity: resource.capacity,
      description: resource.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("resources").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);

    if (error) {
      showToast("Could not delete resource", "error");
      return;
    }

    showToast("Resource deleted", "success");
    fetchResources();
  };

  return (
    <div className="manage-resources-page">
      <form className="resource-form" onSubmit={handleSubmit}>
        <h3>{form.id ? "Edit Resource" : "Add New Resource"}</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Lab A" required />
          </div>
          <div className="form-group">
            <label>Type</label>
            <input name="type" value={form.type} onChange={handleChange} placeholder="e.g. Lab, Court" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional"
          />
        </div>

        <div className="resource-form-actions">
          {form.id && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving..." : form.id ? "Update Resource" : "Add Resource"}
          </button>
        </div>
      </form>

      <h3 className="resources-list-heading">All Resources</h3>

      {loading ? (
        <SkeletonLoader type="row" count={4} />
      ) : resources.length === 0 ? (
        <EmptyState icon="🏢" title="No resources yet" message="Add your first resource above." />
      ) : (
        <div className="admin-resource-list">
          {resources.map((r) => (
            <div className="admin-resource-row" key={r.id}>
              <div className="admin-resource-info">
                <strong>{r.name}</strong>
                <span className="admin-resource-meta">
                  {r.type} · {r.location} · Capacity {r.capacity}
                </span>
              </div>
              <div className="admin-resource-actions">
                <button className="btn-edit" onClick={() => handleEditClick(r)}>
                  Edit
                </button>
                <button className="btn-reject" onClick={() => setDeleteTarget(r)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete this resource?"
          message={`"${deleteTarget.name}" will be permanently removed. Existing bookings for it will remain in history.`}
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default ManageResources;