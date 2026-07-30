import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "../Styles/Profile.css";

/**
 * Profile page — edit name, change password, upload a profile
 * picture (Supabase Storage), and demo notification preferences.
 */
const Profile = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(profile?.name || "");
  const [savingName, setSavingName] = useState(false);

  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [notifyEmail, setNotifyEmail] = useState(
    () => localStorage.getItem("settings.notifyEmail") !== "false"
  );
  const [notifyInApp, setNotifyInApp] = useState(
    () => localStorage.getItem("settings.notifyInApp") !== "false"
  );

  // --- Update name ---
  const handleNameSave = async (e) => {
    e.preventDefault();
    setSavingName(true);
    const { error } = await supabase.from("profiles").update({ name }).eq("id", user.id);
    setSavingName(false);

    if (error) {
      showToast("Could not update name", "error");
      return;
    }
    showToast("Name updated", "success");
  };

  // --- Change password ---
  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
    setSavingPassword(false);

    if (error) {
      showToast(error.message, "error");
      return;
    }

    setPasswords({ newPassword: "", confirmPassword: "" });
    showToast("Password changed", "success");
  };

  // --- Upload avatar ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      showToast("Upload failed", "error");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // cache-bust so the new image shows immediately

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setUploadingAvatar(false);

    if (updateError) {
      showToast("Could not save avatar", "error");
      return;
    }

    setAvatarUrl(publicUrl);
    showToast("Profile picture updated", "success");
  };

  // --- Notification prefs (local demo only) ---
  const handleNotifSave = () => {
    localStorage.setItem("settings.notifyEmail", notifyEmail);
    localStorage.setItem("settings.notifyInApp", notifyInApp);
    showToast("Notification preferences saved", "success");
  };

  return (
    <div className="profile-page">
      <div className="profile-panel">
        <h3>Profile Picture</h3>
        <div className="avatar-row">
          <div className="avatar-preview">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Profile" />
            ) : (
              <span>{profile?.name?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
          <label className="avatar-upload-btn">
            {uploadingAvatar ? "Uploading..." : "Change Picture"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
            />
          </label>
        </div>
      </div>

      <div className="profile-panel">
        <h3>Personal Information</h3>
        <form className="profile-form" onSubmit={handleNameSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input value={user?.email || ""} disabled />
            <span className="field-hint">Email can't be changed here.</span>
          </div>
          <div className="form-group">
            <label>Role</label>
            <input value={profile?.role || ""} disabled className="capitalize" />
          </div>
          <button type="submit" className="btn-primary" disabled={savingName}>
            {savingName ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="profile-panel">
        <h3>Change Password</h3>
        <form className="profile-form" onSubmit={handlePasswordSave}>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              minLength={6}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="profile-panel">
        <h3>Notification Settings</h3>
        <p className="settings-note">Demo preferences — stored locally in this browser only.</p>

        <div className="settings-row">
          <span className="settings-label">Email notifications</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <div className="settings-row">
          <span className="settings-label">In-app notifications</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifyInApp}
              onChange={(e) => setNotifyInApp(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>

        <button className="btn-primary settings-save-btn" onClick={handleNotifSave}>
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default Profile;