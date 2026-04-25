const Appointment = require("../models/Appointment");

// Crear turno
const createAppointment = async (req, res) => {
  try {
    const { clientName, service, date, time } = req.body;

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

module.exports = {
  createAppointment,
};