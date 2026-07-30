import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../Styles/ResetPassword.css";

/**
 * Reset Password page — the page a user lands on after clicking the
 * link in their password reset email. Supabase automatically reads
 * the token from the URL and creates a temporary session, so this
 * page just needs to call updateUser() with the new password.
 */
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h2 className="reset-heading">Set a new password</h2>

        {success ? (
          <div className="reset-success">
            Password updated! Redirecting you to login...
          </div>
        ) : (
          <>
            <p className="reset-subheading">
              Choose a new password for your account.
            </p>

            {error && <div className="reset-error">{error}</div>}

            <form className="reset-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="reset-submit" disabled={loading}>
                {loading ? <span className="spinner" aria-hidden="true"></span> : "Update Password"}
              </button>
            </form>

            <p className="reset-switch">
              <Link to="/login">Back to login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;