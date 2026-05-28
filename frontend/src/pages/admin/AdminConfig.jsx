import { useEffect, useState } from "react";
import api from "../../api";

function AdminConfig() {
  const [config, setConfig] = useState({
    open: "09:00",
    close: "22:00",
    interval: 30,
    hasBreak: false,
    breakStart: "13:00",
    breakEnd: "14:00",
  });

  // 🔥 NUEVO: LOCAL
  const [local, setLocal] = useState({
    name: "",
    address: "",
    phone: "",
    image: "",
    description: "",
  });

  const [toast, setToast] = useState("");

  // ------------------------
  // FETCH CONFIG + LOCAL
  // ------------------------
  useEffect(() => {
    api.get("/config")
      .then((res) => {
        setConfig({
          open: res.data.open ?? "09:00",
          close: res.data.close ?? "22:00",
          interval: res.data.interval ?? 30,
          hasBreak: res.data.hasBreak ?? false,
          breakStart: res.data.breakStart ?? "13:00",
          breakEnd: res.data.breakEnd ?? "14:00",
        });
      })
      .catch(() => setToast("Error cargando config"));

    // 🔥 LOCAL
    api.get("/local")
      .then((res) => {
        setLocal({
          name: res.data.name || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          image: res.data.image || "",
          description: res.data.description || "",
        });
      })
      .catch(() => setToast("Error cargando local"));
  }, []);

  // ------------------------
  // VALIDACIÓN
  // ------------------------
  const validate = (cfg) => {
    const toMin = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const open = toMin(cfg.open);
    const close = toMin(cfg.close);

    if (open >= close) return "Horario inválido";

    if (cfg.hasBreak) {
      const b1 = toMin(cfg.breakStart);
      const b2 = toMin(cfg.breakEnd);

      if (b1 >= b2) return "Break inválido";
      if (b1 < open || b2 > close) return "Break fuera de horario";
    }

    return null;
  };

  // ------------------------
  // GUARDAR CONFIG
  // ------------------------
  const saveConfig = async () => {
    const error = validate(config);
    if (error) return setToast(error);

    try {
      await api.put("/config", config);
      setToast("Configuración guardada 🔥");
    } catch {
      setToast("Error guardando config");
    }
  };

  // ------------------------
  // 🔥 GUARDAR LOCAL
  // ------------------------
  const saveLocal = async () => {
    try {
      await api.put("/local", local);
      setToast("Perfil del local actualizado 💈");
    } catch {
      setToast("Error guardando local");
    }
  };

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="section">

      {/* ========================= */}
      {/* 🏪 PERFIL DEL LOCAL */}
      {/* ========================= */}

      <div className="section-title">🏪 Perfil del local</div>

      <div className="card">

        {/* IMAGEN */}
        <label>Imagen del local (URL)</label><br />
        <br />
        <input
          className="input"
          type="text"
          placeholder="https://..."
          value={local.image}
          onChange={(e) =>
            setLocal({ ...local, image: e.target.value })
          }
        />

        {/* PREVIEW IMG */}
        {local.image && (
          <img
            src={local.image}
            alt="preview"
            style={{
              width: "100%",
              height: "120px",
              objectFit: "cover",
              borderRadius: "10px",
              marginTop: "10px"
            }}
          />
        )}

        <br />

        {/* NAME */}
        <label>Nombre del local</label><br />
        <br />
        <input
          className="input"
          value={local.name}
          onChange={(e) =>
            setLocal({ ...local, name: e.target.value })
          }
        />

        {/* ADDRESS */}
        <label>Dirección</label><br />
        <br />
        <input
          className="input"
          value={local.address}
          onChange={(e) =>
            setLocal({ ...local, address: e.target.value })
          }
        />

        {/* PHONE */}
        <label>Teléfono</label><br />
        <br />
        <input
          className="input"
          value={local.phone}
          onChange={(e) =>
            setLocal({ ...local, phone: e.target.value })
          }
        />

        {/* DESCRIPTION */}
        <label>Descripción</label><br />
        <br />
        <textarea
          className="input"
          value={local.description}
          onChange={(e) =>
            setLocal({ ...local, description: e.target.value })
          }
        />

        <button
          className="button primary full"
          onClick={saveLocal}
        >
          Guardar perfil
        </button>
      </div>

      <br />

      {/* ========================= */}
      {/* ⚙️ CONFIG HORARIOS */}
      {/* ========================= */}

      <div className="section-title">⚙️ Configuración de horarios</div>

      <div className="card">

        {/* OPEN */}
        <label>Horario apertura</label><br />
        <br />
        <input
          className="input"
          type="time"
          value={config.open}
          onChange={(e) =>
            setConfig({ ...config, open: e.target.value })
          }
        />

        <br />

        {/* CLOSE */}
        <label>Horario cierre</label><br />
        <br />
        <input
          className="input"
          type="time"
          value={config.close}
          onChange={(e) =>
            setConfig({ ...config, close: e.target.value })
          }
        />

        <br />

        {/* INTERVAL */}
        <label>Intervalo de turnos</label><br />
        <br />
        <select
          className="input"
          value={config.interval}
          onChange={(e) =>
            setConfig({ ...config, interval: Number(e.target.value) })
          }
        >
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>60 min</option>
        </select>

        {/* BREAK */}
        <label>¿Break?</label><br />
        <br />
        <select
          className="input"
          value={config.hasBreak ? "yes" : "no"}
          onChange={(e) =>
            setConfig({
              ...config,
              hasBreak: e.target.value === "yes",
            })
          }
        >
          <option value="no">No</option>
          <option value="yes">Sí</option>
        </select>

        {config.hasBreak && (
          <>
            <label>Inicio break</label>
            <br />
            <input
              className="input"
              type="time"
              value={config.breakStart}
              onChange={(e) =>
                setConfig({ ...config, breakStart: e.target.value })
              }
            />

            <label>Fin break</label>
            <br />
            <input
              className="input"
              type="time"
              value={config.breakEnd}
              onChange={(e) =>
                setConfig({ ...config, breakEnd: e.target.value })
              }
            />
          </>
        )}

        <button
          className="button primary full"
          onClick={saveConfig}
        >
          Guardar configuración
        </button>

        {toast && <p>{toast}</p>}
      </div>

      <br />

      {/* PREVIEW */}
      <div className="card">
        <h3>Preview</h3>

        <p>🏪 {local.name || "Sin nombre"}</p>
        <p>📍 {local.address || "Sin dirección"}</p>

        <p>🟢 Abre: {config.open}</p>
        <p>🔴 Cierra: {config.close}</p>
        <p>⏱ Intervalo: {config.interval} min</p>
        <p>
          🍽 Break:{" "}
          {config.hasBreak
            ? `${config.breakStart} - ${config.breakEnd}`
            : "No"}
        </p>
      </div>

    </div>
  );
}

export default AdminConfig;