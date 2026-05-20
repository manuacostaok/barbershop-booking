const Appointment = require("../models/Appointment");

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
    const { clientName, clientPhone, clientEmail, service, date, time, duration, barber } = req.body;

    // 🔹 Validaciones
    if (!clientName) {
      return res.status(400).json({
        message: "Faltan completar tu nombre",
      });
    }
    if (!clientEmail) {
      return res.status(400).json({
        message: "Falta completar tu mail",
      });
    }

    if (!date || !time) {
      return res.status(400).json({
        message: "Falta seleccionar fecha y horario",
      });
    }

    if (!service) {
      return res.status(400).json({
        message: "Falta seleccionar el corte",
      });
    }

    if (!clientPhone) {
      return res.status(400).json({
        message: "El teléfono del cliente es obligatorio",
      });
    }

    if (!barber) {
      return res.status(400).json({
        message: "Debes seleccionar un barbero",
      });
    }

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
      clientName,
      clientPhone,
      clientEmail,
      service,
      date,
      time,
      duration: duration || 30,
      barber,
    });

    const saved = await newAppointment.save();

    res.status(201).json(saved);

  } catch (error) {
    console.log("ERROR CREATE APPOINTMENT:", error);

    res.status(500).json({
      message: "Error creando turno",
      error,
    });
  }
};

// =======================================
// 🔥 DISPONIBILIDAD
// =======================================
const getAvailability = async (req, res) => {
  try {
    const { date, barber } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Falta la fecha",
      });
    }

    if (!barber) {
      return res.status(400).json({
        message: "Falta el barbero",
      });
    }

    const allSlots = [
      "09:00","09:30",
      "10:00","10:30",
      "11:00","11:30",
      "12:00","12:30",
      "13:00","13:30",
      "14:00","14:30",
      "15:00","15:30",
      "16:00","16:30",
      "17:00"
    ];

    const appointments = await Appointment.find({ date, barber });

    let occupiedSlots = [];

    appointments.forEach((appt) => {
      let currentTime = appt.time;
      let remaining = appt.duration;

      while (remaining > 0) {
        occupiedSlots.push(currentTime);

        const minutes = timeToMinutes(currentTime) + 30;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;

        currentTime = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        remaining -= 30;
      }
    });

    const available = allSlots.filter(
      (slot) => !occupiedSlots.includes(slot)
    );

    res.json({ date, available });

  } catch (error) {
    console.log("ERROR AVAILABILITY:", error);

    res.status(500).json({
      message: "Error getting availability",
    });
  }
};

// =======================================
// 🔥 NUEVO: TURNOS DEL BARBERO LOGUEADO
// =======================================
const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      barber: req.user.id,
    }).populate("barber", "name");

    res.json(appointments);
  } catch (err) {
    res.status(500).json({
      message: "Error obteniendo turnos",
    });
  }
};

// =======================================
// 🔥 NUEVO: TODOS LOS TURNOS (ADMIN)
// =======================================
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("barber", "name");

    res.json(appointments);
  } catch (err) {
    res.status(500).json({
      message: "Error obteniendo todos los turnos",
    });
  }
};

const completeAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);

    if (!appt) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    // 🔥 marcar como completado
    appt.status = "completed";
    await appt.save();

    // 🔍 buscar cliente
    const user = await User.findOne({ phone: appt.clientPhone });

    if (user) {
      // 🧾 historial
      user.appointmentsHistory.push({
        service: appt.service,
        barber: appt.barber,
        date: appt.date,
        time: appt.time,
        price: 0
      });

      // 🔥 contar servicios iguales
      const sameServices = user.appointmentsHistory.filter(
        (h) => h.service === appt.service
      );

      const count = sameServices.length;

      let reward = null;

      // 🎁 cada 5 → 1 gratis
      if (count % 5 === 0) {
        reward = `🎁 Corte gratis: ${appt.service}`;

        // opcional: marcarlo
        user.appointmentsHistory.push({
          service: appt.service,
          barber: appt.barber,
          date: appt.date,
          time: "REWARD",
          price: 0,
          reward: true
        });
      }

      await user.save();

      return res.json({
        message: "Turno completado",
        reward
      });
    }

    res.json({ message: "Turno completado" });

  } catch (err) {
    res.status(500).json({ message: "Error completando turno" });
  }
};

// =======================================
// EXPORT
// =======================================
module.exports = {
  createAppointment,
  getAvailability,
  getMyAppointments,
  getAllAppointments,
  completeAppointment
};