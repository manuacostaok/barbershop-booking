const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Config = require("../models/Config");

// helper
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// =======================================
// 🔥 CREAR TURNO
// =======================================
const createAppointment = async (req, res) => {
  try {
    const {
      clientName,
      clientPhone,
      clientEmail,
      service,
      date,
      time,
      duration,
      barber
    } = req.body;

    if (!clientName) return res.status(400).json({ message: "Faltan completar tu nombre" });
    if (!clientEmail) return res.status(400).json({ message: "Falta completar tu mail" });
    if (!date || !time) return res.status(400).json({ message: "Falta fecha y horario" });
    if (!service) return res.status(400).json({ message: "Falta seleccionar el corte" });
    if (!clientPhone) return res.status(400).json({ message: "El teléfono es obligatorio" });
    if (!barber) return res.status(400).json({ message: "Debes seleccionar un barbero" });

    const newStart = timeToMinutes(time);
    const newEnd = newStart + (duration || 30);

    const appointments = await Appointment.find({ date, barber });

    for (let appt of appointments) {
      const apptStart = timeToMinutes(appt.time);
      const apptEnd = apptStart + appt.duration;

      if (newStart < apptEnd && newEnd > apptStart) {
        return res.status(400).json({
          message: "Este horario se solapa con otro turno",
        });
      }
    }

    const newAppointment = new Appointment({
      clientId: req.user?.id || null,
      clientName,
      clientPhone,
      clientEmail,
      service,
      date,
      time,
      duration: duration || 30,
      barber,
      status: "pending", // 🔥 IMPORTANTE
    });

    const saved = await newAppointment.save();

    res.status(201).json(saved);

  } catch (error) {
    console.log("ERROR CREATE APPOINTMENT:", error);
    res.status(500).json({ message: "Error creando turno" });
  }
};

// =======================================
// 🔥 DISPONIBILIDAD
// =======================================
const getAvailability = async (req, res) => {
  try {
    const { date, barber } = req.query;

    const config = await Config.findOne();

    if (!config) {
      return res.status(400).json({ message: "Config no encontrada" });
    }

    const toMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const fromMinutes = (min) => {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const slots = [];

    let start = toMinutes(config.open);
    const end = toMinutes(config.close);

    const breakStart = config.hasBreak ? toMinutes(config.breakStart) : null;
    const breakEnd = config.hasBreak ? toMinutes(config.breakEnd) : null;

    while (start < end) {
      if (config.hasBreak && start >= breakStart && start < breakEnd) {
        start += config.interval;
        continue;
      }

      slots.push(fromMinutes(start));
      start += config.interval;
    }

    const appointments = await Appointment.find({ date, barber });

    let occupiedSlots = [];

    appointments.forEach((appt) => {
      let currentTime = appt.time;
      let remaining = appt.duration;

      while (remaining > 0) {
        occupiedSlots.push(currentTime);

        const minutes = toMinutes(currentTime) + config.interval;
        currentTime = fromMinutes(minutes);

        remaining -= config.interval;
      }
    });

    const available = slots.filter(
      (slot) => !occupiedSlots.includes(slot)
    );

    res.json({ available });

  } catch (error) {
    console.log("ERROR AVAILABILITY:", error);
    res.status(500).json({ message: "Error getting availability" });
  }
};

// =======================================
// 🔥 BARBER
// =======================================
const getMyAppointments = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "barber") {
      query = { barber: req.user.id };
    } else {
      query = { clientId: req.user.id };
    }

    const appointments = await Appointment.find(query)
      .populate("barber", "name")
      .sort({ date: -1 });

    res.json(appointments);

  } catch (err) {
    res.status(500).json({
      message: "Error obteniendo turnos",
    });
  }
};

// =======================================
// 🔥 ADMIN
// =======================================
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("barber", "name");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Error obteniendo todos los turnos" });
  }
};

// =======================================
// 🔥 COMPLETE
// =======================================
const completeAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    if (appt.status === "cancelled") {
      return res.status(400).json({ message: "No podés completar un turno cancelado" });
    }

    appt.status = "completed";
    await appt.save();

    // 🔥 SOLO SI HAY CLIENTE LOGUEADO
    if (appt.clientId) {
      const user = await User.findById(appt.clientId);

      if (user) {

        // 🔥 FIX CLAVE
        if (!user.appointmentsHistory) {
          user.appointmentsHistory = [];
        }

        user.appointmentsHistory.push({
          service: appt.service,
          barber: appt.barber,
          date: appt.date,
          time: appt.time,
          price: 0,
        });

        await user.save();
      }
    }

    res.json({
      message: "Turno completado",
      suggestion: appt.clientId
        ? null
        : "Este cliente no está registrado. Si se registra con este email podrá ver su historial.",
    });

  } catch (err) {
    console.log("🔥 ERROR COMPLETE:", err); // IMPORTANTE
    res.status(500).json({ message: "Error completando turno" });
  }
};

// =======================================
// 🔥 CONFIRMAR
// =======================================
const confirmAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    if (appt.status !== "pending") {
      return res.status(400).json({ message: "Solo se pueden confirmar turnos pendientes" });
    }

    appt.status = "confirmed";
    await appt.save();

    res.json({ message: "Turno confirmado" });

  } catch {
    res.status(500).json({ message: "Error confirmando turno" });
  }
};

// =======================================
// 🔥 CANCELAR
// =======================================
const cancelAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    if (appt.status === "completed") {
      return res.status(400).json({ message: "No podés cancelar un turno ya completado" });
    }

    appt.status = "cancelled";
    await appt.save();

    res.json({ message: "Turno cancelado" });

  } catch (err) {
    res.status(500).json({ message: "Error cancelando turno" });
  }
};

// =======================================
// 🔥 REACTIVAR
// =======================================
const reactivateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    if (appt.status !== "cancelled") {
      return res.status(400).json({ message: "Solo podés reactivar turnos cancelados" });
    }

    appt.status = "pending";
    await appt.save();

    res.json({ message: "Turno reactivado" });

  } catch (err) {
    res.status(500).json({ message: "Error reactivando turno" });
  }
};

// =======================================
// 🔥 DELETE
// =======================================
const deleteAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    await appt.deleteOne();

    res.json({ message: "Turno eliminado" });

  } catch (err) {
    res.status(500).json({ message: "Error eliminando turno" });
  }
};

module.exports = {
  createAppointment,
  getAvailability,
  getMyAppointments,
  getAllAppointments,
  completeAppointment,
  confirmAppointment, 
  cancelAppointment,
  reactivateAppointment,
  deleteAppointment
};