import { useState } from "react";
import Button from "../common/Button";

// Email and role are read-only. Name and phone can be edited locally.
function ProfileForm({ profile, onSave }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Name is required.");
    if (phone && !/^[0-9+\-\s]{7,15}$/.test(phone)) return setError("Enter a valid phone number.");
    setError("");
    onSave({ name: name.trim(), phone });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="profile-name">Full name</label>
        <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="profile-email">Email</label>
        <input id="profile-email" value={profile.email} readOnly />
      </div>
      <div className="form-field">
        <label htmlFor="profile-phone">Phone (optional)</label>
        <input id="profile-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="form-field">
        <label htmlFor="profile-role">Role</label>
        <input id="profile-role" value={profile.role} readOnly />
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <Button type="submit">Save changes</Button>
    </form>
  );
}

export default ProfileForm;
