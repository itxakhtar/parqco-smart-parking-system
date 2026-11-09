import { useState } from "react";
import Card from "../../components/common/Card";
import ProfileForm from "../../components/user/ProfileForm";
import { useAuth } from "../../hooks/useAuth";

// TODO: load and save through userService once the backend exists.
function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: user.name, email: user.email, role: user.role, phone: "" });
  const [saved, setSaved] = useState(false);

  const handleSave = (changes) => {
    setProfile({ ...profile, ...changes });
    setSaved(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p className="muted">Changes apply to this screen only: backend integration pending.</p>
      </div>
      <Card className="form-card">
        <ProfileForm profile={profile} onSave={handleSave} />
        {saved && <p className="form-note" role="status">Updated on this screen only. Nothing was sent to a server.</p>}
      </Card>
    </div>
  );
}

export default Profile;
