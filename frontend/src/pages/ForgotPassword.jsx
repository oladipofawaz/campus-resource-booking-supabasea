import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../Styles/ForgotPassword.css";

/**
 * Forgot Password page — sends a Supabase password reset email.
 * The email contains a link back to /reset-password with a token
 * that Supabase uses to authorize the actual password change.
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">
        <h2 className="forgot-heading">Reset your password</h2>

        {sent ? (
          <div className="forgot-success">
            <p>
              If an account exists for <strong>{email}</strong>, a password
              reset link has been sent. Check your inbox (and spam folder).
            </p>
            <Link to="/login" className="forgot-back-link">
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <p className="forgot-subheading">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {error && <div className="forgot-error">{error}</div>}

            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <button type="submit" className="forgot-submit" disabled={loading}>
                {loading ? <span className="spinner" aria-hidden="true"></span> : "Send Reset Link"}
              </button>
            </form>

            <p className="forgot-switch">
              Remembered your password? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;