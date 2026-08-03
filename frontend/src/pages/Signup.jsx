import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../Styles/Signup.css";

/**
 * Signup page — redesigned with password strength indicator,
 * show/hide password, and confirm-password validation.
 *
 * The "Admin" role option is hidden from the public signup form.
 * It only appears when the page is visited with ?admin=true in the URL
 * (e.g. yoursite.com/signup?admin=true), so regular students never see it.
 */
const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showAdminOption = searchParams.get("admin") === "true";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Simple password strength scorer: length + variety of character types
  const passwordStrength = useMemo(() => {
    const pw = form.password;
    if (!pw) return { score: 0, label: "" };

    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { label: "Very Weak", className: "very-weak" },
      { label: "Weak", className: "weak" },
      { label: "Fair", className: "fair" },
      { label: "Good", className: "good" },
      { label: "Strong", className: "strong" },
    ];

    const index = Math.min(score, levels.length - 1);
    return { score, ...levels[index] };
  }, [form.password]);

  const passwordsMatch =
    form.confirmPassword.length === 0 || form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    const { error } = await signUp(form);
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setInfo("Account created! Redirecting you to log in...");
    setTimeout(() => navigate("/login"), 1800);
  };

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-brand-panel">
          <h1 className="signup-brand-title">Join Campus Resource Booking</h1>
          <p className="signup-brand-text">
            Reserve labs, seminar rooms, and equipment in seconds — track your
            bookings, get real-time approval status, and never double-book.
          </p>
        </div>

        <div className="signup-form-panel">
          <h2 className="signup-heading">Create your account</h2>
          <p className="signup-subheading">It only takes a minute</p>

          {error && <div className="signup-error">{error}</div>}
          {info && <div className="signup-info">{info}</div>}

          <form className="signup-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
            </div>

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
                  placeholder="Create a password"
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

              {form.password && (
                <div className="strength-meter">
                  <div className="strength-bars">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`strength-bar ${
                          i < passwordStrength.score ? passwordStrength.className : ""
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label ${passwordStrength.className}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className={!passwordsMatch ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {!passwordsMatch && (
                <span className="field-error">Passwords do not match</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role">I am a</label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                {showAdminOption && <option value="admin">Admin</option>}
              </select>
            </div>

            <button type="submit" className="signup-submit" disabled={loading}>
              {loading ? <span className="spinner" aria-hidden="true"></span> : "Create Account"}
            </button>
          </form>

          <p className="signup-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;