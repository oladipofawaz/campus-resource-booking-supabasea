import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import "../../Styles/SystemSettings.css";

/**
 * Admin sub-page: app-wide preferences. Currently these are stored
 * client-side (localStorage) since there's no dedicated settings
 * table in the schema — noted clearly below so it's not mistaken
 * for server-enforced configuration.
 */
const SystemSettings = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [autoApprove, setAutoApprove] = useState(
    () => localStorage.getItem("settings.autoApprove") === "true"
  );
  const [maxBookingDays, setMaxBookingDays] = useState(
    () => localStorage.getItem("settings.maxBookingDays") || "14"
  );

  const handleSave = () => {
    localStorage.setItem("settings.autoApprove", autoApprove);
    localStorage.setItem("settings.maxBookingDays", maxBookingDays);
    showToast("Settings saved", "success");
  };

  return (
    <div className="settings-page">
      <div className="settings-panel">
        <h3>Appearance</h3>
        <div className="settings-row">
          <div>
            <p className="settings-label">Theme</p>
            <p className="settings-desc">Switch between light and dark mode.</p>
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Switch to Dark" : "☀️ Switch to Light"}
          </button>
        </div>
      </div>

      <div className="settings-panel">
        <h3>Booking Rules</h3>
        <p className="settings-note">
          Note: these are local demo settings (not yet enforced by the database) —
          a production version would move these into a dedicated settings table
          and reference them from the <code>book_resource()</code> function.
        </p>

        <div className="settings-row">
          <div>
            <p className="settings-label">Auto-approve bookings</p>
            <p className="settings-desc">Skip manual admin approval for new requests.</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <div>
            <p className="settings-label">Max days in advance</p>
            <p className="settings-desc">How far ahead students can book.</p>
          </div>
          <input
            type="number"
            className="settings-number-input"
            value={maxBookingDays}
            onChange={(e) => setMaxBookingDays(e.target.value)}
            min="1"
          />
        </div>

        <button className="btn-primary settings-save-btn" onClick={handleSave}>
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SystemSettings;