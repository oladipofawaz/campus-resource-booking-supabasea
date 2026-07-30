import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/Login.css";

/**
 * Login page — authenticates an existing user via Supabase.
 * Includes show/hide password toggle and a "Remember Me" checkbox
 * (stores the user's email locally so it's pre-filled next visit).
 */
const Login = () => {
  const [form, setForm] = useState({
    email: localStorage.getItem("rememberedEmail") || "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(
    !!localStorage.getItem("rememberedEmail")
  );
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Updates form state as the user types
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(form);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Handle "Remember Me" — only persist the email, never the password
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", form.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Left panel: branding / illustration side */}
        <div className="login-brand-panel">
          <h1 className="login-brand-title">Campus Resource Booking</h1>
          <p className="login-brand-text">
            Book labs, rooms, and equipment across campus — all in one place.
          </p>
        </div>

        {/* Right panel: the actual form */}
        <div className="login-form-panel">
          <h2 className="login-heading">Welcome back</h2>
          <p className="login-subheading">Log in to continue to your dashboard</p>

          {error && <div className="login-error">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
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

            <div className="login-row">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" aria-hidden="true"></span>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <p className="login-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;