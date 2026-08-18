import { useState, useRef } from "react";
import api from "../../api";
import { compressImage } from "../../utils/imageUpload";
import { FaCamera, FaSpinner } from "react-icons/fa";

export default function BarberProfile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [uploading, setUploading] = useState(null); // "avatar" | "banner" | null
  const [toast, setToast] = useState("");

  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "B";

  const persistUser = (updated) => {
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(field);
    setToast("");

    try {
      const dataUrl = await compressImage(file, {
        maxWidth: field === "banner" ? 1600 : 500,
        maxHeight: field === "banner" ? 500 : 500,
        quality: 0.82,
      });

      const res = await api.put(`/auth/${field}`, { [field]: dataUrl });
      persistUser(res.data);
      setToast(field === "avatar" ? "Foto de perfil actualizada" : "Banner actualizado");
    } catch (err) {
      setToast(err.response?.data?.message || err.message || "Error subiendo la imagen");
    } finally {
      setUploading(null);
      e.target.value = "";
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Mi perfil</h2>
      </div>

      {/* BANNER */}
      <div
        className="profile-banner"
        style={user?.banner ? { backgroundImage: `url(${user.banner})` } : undefined}
        onClick={() => bannerInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={bannerInputRef}
          hidden
          onChange={(e) => handleUpload(e, "banner")}
        />

        <div className="profile-banner-edit">
          {uploading === "banner" ? <FaSpinner className="spin" /> : <FaCamera />}
          <span>{user?.banner ? "Cambiar banner" : "Agregar banner"}</span>
        </div>
      </div>

      <div className="profile-card profile-card-with-banner">
        <div
          className="profile-avatar profile-avatar-upload"
          onClick={() => avatarInputRef.current?.click()}
        >
          <input
            type="file"
            accept="image/*"
            ref={avatarInputRef}
            hidden
            onChange={(e) => handleUpload(e, "avatar")}
          />

          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            initial
          )}

          <div className="profile-avatar-overlay">
            {uploading === "avatar" ? <FaSpinner className="spin" /> : <FaCamera />}
          </div>
        </div>

        <div className="profile-info">
          <h3>{user?.name}</h3>
          <p>{user?.email}</p>
          {user?.phone && <p>{user.phone}</p>}
        </div>
      </div>

      {toast && <p className="config-toast">{toast}</p>}

      <p className="profile-hint">
        Tu foto de perfil se ve en la selección de profesionales cuando un cliente reserva un turno.
      </p>
    </div>
  );
}
