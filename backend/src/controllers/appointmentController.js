const Appointment = require("../models/Appointment");

// helper
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Crear turno
const createAppointment = async (req, res) => {
  try {
    const { clientName, clientPhone,service, date, time, duration, barber } = req.body;

    // 🔹 Validación general
    if (!clientName ) {
      return res.status(400).json({
        message: "Faltan completar tu nombre",
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
    // 🔥 VALIDACIÓN ESPECÍFICA DE BARBERO
    if (!barber) {
      return res.status(400).json({
        message: "Debes seleccionar un barbero",
      });
    }

    const newStart = timeToMinutes(time);
    const newEnd = newStart + duration;

    // 🔥 filtrar por fecha + barbero
    const appointments = await Appointment.find({ date, barber });

    for (let appt of appointments) {
      const apptStart = timeToMinutes(appt.time);
      const apptEnd = apptStart + appt.duration;

      // 🔥 chequeo de solapamiento real
      if (newStart < apptEnd && newEnd > apptStart) {
        return res.status(400).json({
          message: "Este horario se solapa con otro turno",
        });
      }
    }

    const newAppointment = new Appointment({
      clientName,
      clientPhone,
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

// Disponibilidad por fecha + barbero
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

    const timeToMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

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
    console.log("ERROR AVAILABILITY:", error); // 🔥 esto es clave

    res.status(500).json({
      message: "Error getting availability",
    });
  }
};


module.exports = {
  createAppointment,
  getAvailability,
};