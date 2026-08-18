import { useState, useRef } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../api";
import { compressImage } from "../../utils/imageUpload";
import { FaCamera, FaSpinner } from "react-icons/fa";

export default function ClientProfile() {
  const { user: contextUser, setUser: setContextUser } = useOutletContext();
  const [user, setUser] = useState(contextUser);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState("");
  const avatarInputRef = useRef(null);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "C";

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setToast("");

    try {
      const dataUrl = await compressImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.82 });
      const res = await api.put("/auth/avatar", { avatar: dataUrl });

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setContextUser?.(res.data);
      setToast("Foto de perfil actualizada");
    } catch (err) {
      setToast(err.response?.data?.message || err.message || "Error subiendo la imagen");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="page client-panel">
      <div className="page-header">
        <h1>Mi perfil</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar profile-avatar-upload" onClick={() => avatarInputRef.current?.click()}>
          <input type="file" accept="image/*" ref={avatarInputRef} hidden onChange={handleUpload} />

          {user?.avatar ? <img src={user.avatar} alt={user.name} /> : initial}

          <div className="profile-avatar-overlay">
            {uploading ? <FaSpinner className="spin" /> : <FaCamera />}
          </div>
        </div>

        <div className="profile-info">
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <p>{user.phone}</p>
        </div>
      </div>

      {toast && <p className="config-toast">{toast}</p>}
    </div>
  );
}
