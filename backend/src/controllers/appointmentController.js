const Appointment = require("../models/Appointment");

// función helper
const timeToMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Crear turno
const createAppointment = async (req, res) => {
  try {
    const { clientName, service, date, time, duration } = req.body;

    // validar datos básicos
    if (!clientName || !service || !date || !time || !duration) {
      return res.status(400).json({
        message: "Faltan datos obligatorios",
      });
    }

    const newStart = timeToMinutes(time);
    const newEnd = newStart + duration;

    // traer turnos del mismo día
    const appointments = await Appointment.find({ date });

    // 🔥 validar solapamiento real
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
      service,
      date,
      time,
      duration,
    });

    const saved = await newAppointment.save();

    res.status(201).json(saved);

  } catch (error) {
    res.status(500).json({ message: "Error creating appointment", error });
  }
};

// Obtener disponibilidad por fecha
const getAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Falta la fecha",
      });
    }

    // slots cada 30 min
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

    const appointments = await Appointment.find({ date });

    const addMinutes = (time, minutes) => {
      const [h, m] = time.split(":").map(Number);
      const dateObj = new Date();
      dateObj.setHours(h);
      dateObj.setMinutes(m + minutes);
      return dateObj.toTimeString().slice(0,5);
    };

    let occupiedSlots = [];

    appointments.forEach((appt) => {
      let currentTime = appt.time;
      let remaining = appt.duration;

      while (remaining > 0) {
        occupiedSlots.push(currentTime);
        currentTime = addMinutes(currentTime, 30);
        remaining -= 30;
      }
    });

    const available = allSlots.filter(
      (slot) => !occupiedSlots.includes(slot)
    );

    res.json({ date, available });

  } catch (error) {
    res.status(500).json({ message: "Error getting availability" });
  }
};

module.exports = {
  createAppointment,
  getAvailability,
};