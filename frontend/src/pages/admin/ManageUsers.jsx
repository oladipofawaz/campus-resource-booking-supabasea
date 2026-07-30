import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useToast } from "../../context/ToastContext";
import SkeletonLoader from "../../components/SkeletonLoader";
import EmptyState from "../../components/EmptyState";
import "../../Styles/ManageUsers.css";

/**
 * Admin sub-page: view all registered users and change their role
 * between student/admin. Does NOT delete auth accounts — that
 * requires the Supabase service role key, which must never be
 * exposed in frontend code, so account deletion is intentionally
 * left as a backend/Edge Function task (noted in the README).
 */
const ManageUsers = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    setUpdatingId(id);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    setUpdatingId(null);

    if (error) {
      showToast("Could not update role", "error");
      return;
    }

    showToast("Role updated", "success");
    fetchUsers();
  };

  return (
    <div className="manage-users-page">
      <h3>All Users</h3>

      {loading ? (
        <SkeletonLoader type="row" count={5} />
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={updatingId === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className={`role-select role-${u.role}`}
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;