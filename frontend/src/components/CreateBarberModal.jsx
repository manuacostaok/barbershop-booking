import BaseModal from "./BaseModal";
import { useLanguage } from "../components/LanguageContext";

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
  setPrice
}) {
  const { t } = useLanguage();

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="modal-header">
        <h2 className="modal-title">
          {type === "barber" ? t.newBarber : t.newService}
        </h2>
      </div>

      <div className="modal-form">
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
        <button className="btn-secondary" onClick={onClose}>
          {t.cancel}
        </button>

        <button
          className="btn-primary"
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