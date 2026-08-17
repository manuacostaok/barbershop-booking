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

    // 🔥 NUEVO: LOYALTY
    loyaltyEnabled: false,
    loyaltyCuts: 5,
    loyaltyReward: "Corte gratis",
  });

  // 🔥 LOCAL
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

          // 🔥 LOYALTY
          loyaltyEnabled: res.data.loyaltyEnabled ?? false,
          loyaltyCuts: res.data.loyaltyCuts ?? 5,
          loyaltyReward: res.data.loyaltyReward ?? "Corte gratis",
        });
      })
      .catch(() => setToast("Error cargando config"));

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

    // 🔥 VALIDACIÓN LOYALTY
    if (cfg.loyaltyEnabled) {
      if (cfg.loyaltyCuts <= 0) return "Cantidad de cortes inválida";
      if (!cfg.loyaltyReward) return "Definí el premio";
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
      setToast("Configuración guardada");
    } catch {
      setToast("Error guardando config");
    }
  };

  // ------------------------
  // GUARDAR LOCAL
  // ------------------------
  const saveLocal = async () => {
    try {
      await api.put("/local", local);
      setToast("Perfil del local actualizado");
    } catch {
      setToast("Error guardando local");
    }
  };

  return (
    <div className="section">

      {/* ========================= */}
      {/* 🏪 PERFIL DEL LOCAL */}
      {/* ========================= */}

      <div className="page-header">
        <h2>Perfil del local</h2>
      </div>

      <div className="card config-card">

        <div className="form-group">
          <label>Imagen del local (URL)</label>
          <input
            className="input"
            type="text"
            placeholder="https://..."
            value={local.image}
            onChange={(e) =>
              setLocal({ ...local, image: e.target.value })
            }
          />
        </div>

        {local.image && (
          <img
            src={local.image}
            alt="preview"
            className="local-image-preview"
          />
        )}

        <div className="form-group">
          <label>Nombre del local</label>
          <input
            className="input"
            value={local.name}
            onChange={(e) =>
              setLocal({ ...local, name: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Dirección</label>
          <input
            className="input"
            value={local.address}
            onChange={(e) =>
              setLocal({ ...local, address: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            className="input"
            value={local.phone}
            onChange={(e) =>
              setLocal({ ...local, phone: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea
            className="input"
            value={local.description}
            onChange={(e) =>
              setLocal({ ...local, description: e.target.value })
            }
          />
        </div>

        <button
          className="button primary full"
          onClick={saveLocal}
        >
          Guardar perfil
        </button>
      </div>

      {/* ========================= */}
      {/* ⚙️ CONFIG HORARIOS + PREMIOS */}
      {/* ========================= */}

      <div className="page-header" style={{ marginTop: 32 }}>
        <h2>Configuración del sistema</h2>
      </div>

      <div className="card config-card">

        {/* HORARIOS */}
        <div className="form-row">
          <div className="form-group">
            <label>Horario apertura</label>
            <input
              className="input"
              type="time"
              value={config.open}
              onChange={(e) =>
                setConfig({ ...config, open: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Horario cierre</label>
            <input
              className="input"
              type="time"
              value={config.close}
              onChange={(e) =>
                setConfig({ ...config, close: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>Intervalo de turnos</label>
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
        </div>

        <div className="form-group">
          <label>¿Break?</label>
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
        </div>

        {config.hasBreak && (
          <div className="form-row">
            <div className="form-group">
              <label>Inicio break</label>
              <input
                className="input"
                type="time"
                value={config.breakStart}
                onChange={(e) =>
                  setConfig({ ...config, breakStart: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Fin break</label>
              <input
                className="input"
                type="time"
                value={config.breakEnd}
                onChange={(e) =>
                  setConfig({ ...config, breakEnd: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* PREVIEW */}
        <div className="config-preview">
          <h3>Vista previa</h3>

          <p>{local.name || "Sin nombre"}</p>
          <p>{local.address || "Sin dirección"}</p>
          <p>Abre {config.open} · Cierra {config.close}</p>
          <p>Intervalo: {config.interval} min</p>

          <p>
            Break:{" "}
            {config.hasBreak
              ? `${config.breakStart} - ${config.breakEnd}`
              : "No"}
          </p>

          <p>
            Premio:{" "}
            {config.loyaltyEnabled
              ? `${config.loyaltyReward} cada ${config.loyaltyCuts} cortes`
              : "No activo"}
          </p>
        </div>

        {/* 🎁 SISTEMA DE PREMIOS */}
        <div className="form-group" style={{ marginTop: 20 }}>
          <label>Cupón de fidelidad</label>
          <select
            className="input"
            value={config.loyaltyEnabled ? "yes" : "no"}
            onChange={(e) =>
              setConfig({
                ...config,
                loyaltyEnabled: e.target.value === "yes",
              })
            }
          >
            <option value="no">No</option>
            <option value="yes">Sí</option>
          </select>
        </div>

        {config.loyaltyEnabled && (
          <div className="form-row">
            <div className="form-group">
              <label>Cada cuántos cortes</label>
              <input
                className="input"
                type="number"
                min={1}
                value={config.loyaltyCuts}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    loyaltyCuts: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-group">
              <label>Premio</label>
              <input
                className="input"
                type="text"
                value={config.loyaltyReward}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    loyaltyReward: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}

        <button
          className="button primary full"
          onClick={saveConfig}
          style={{ marginTop: 12 }}
        >
          Guardar configuración
        </button>

        {toast && <p className="config-toast">{toast}</p>}
      </div>

    </div>
  );
}

export default AdminConfig;
