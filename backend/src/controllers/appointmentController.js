const Appointment = require("../models/Appointment");

// Crear turno
const createAppointment = async (req, res) => {
  try {
    const { clientName, service, date, time } = req.body;

    // 🔍 Verificar si ya existe turno en ese horario
    const existing = await Appointment.findOne({ date, time });

    if (existing) {
      return res.status(400).json({
        message: "Este horario ya está reservado",
      });
    }

    const newAppointment = new Appointment({
      clientName,
      service,
      date,
      time,
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

    // horarios de la barbería
    const allSlots = [
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    // turnos ya ocupados
    const appointments = await Appointment.find({ date });

    const bookedTimes = appointments.map((a) => a.time);

    // filtrar disponibles
    const available = allSlots.filter(
      (time) => !bookedTimes.includes(time)
    );

    res.json({
      date,
      available,
    });
  } catch (error) {
    res.status(500).json({ message: "Error getting availability" });
  }
};

module.exports = {
  createAppointment,
  getAvailability,
};

