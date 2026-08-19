import { useRef, useState } from "react";
import BaseModal from "./BaseModal";
import { useLanguage } from "../components/LanguageContext";
import { compressImage } from "../utils/imageUpload";
import { FaCamera, FaSpinner } from "react-icons/fa";

function CreateBarberModal({
  open,
  onClose,
  onCreate,
  type = "barber",
  name,
  setName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  price,
  setPrice,
  image,
  setImage,
}) {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !setImage) return;

    setUploading(true);
    try {
      const dataUrl = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.8 });
      setImage(dataUrl);
    } catch {
      // si falla la compresión simplemente no seteamos imagen —
      // el servicio se puede crear igual sin foto
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="modal-header">
        <h2 className="modal-title">
          {type === "barber" ? t.newBarber : t.newService}
        </h2>
      </div>

      <div className="modal-form">
        {type === "service" && (
          <label className="service-manage-thumb service-create-thumb">
            <input type="file" accept="image/*" ref={fileInputRef} hidden onChange={handleImagePick} />
            {image ? (
              <img src={image} alt="" />
            ) : (
              <span className="service-manage-thumb-empty">
                {uploading ? <FaSpinner className="spin" /> : <FaCamera />}
              </span>
            )}
          </label>
        )}

        <input
          className="input"
          placeholder={t.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {type === "barber" && (
          <>
            <input
              className="input"
              placeholder={t.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              className="input"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="input"
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {type === "service" && (
          <input
            className="input"
            type="number"
            placeholder={t.price}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        )}
      </div>

      <div className="modal-actions">
        <button className="button secondary" onClick={onClose}>
          {t.cancel}
        </button>

        <button
          className="button primary"
          data-confirm="true"
          onClick={onCreate}
        >
          {t.create}
        </button>
      </div>
    </BaseModal>
  );
}

export default CreateBarberModal;
