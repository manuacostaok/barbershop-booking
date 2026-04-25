import { useState } from "react";
import axios from "axios";

function App() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");

  const getAvailability = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/appointments/availability?date=${date}`
    );
    setSlots(res.data.available);
  };

  const createAppointment = async () => {
    await axios.post("http://localhost:5000/api/appointments", {
      clientName: name,
      service: "Corte",
      date,
      time: selectedTime,
      duration: 30,
    });

    alert("Turno creado!");
    getAvailability();
  };

  return (
    <div className="container">
      <div className="card">
        <div className="title">Barber Booking</div>

        <input
          className="input"
          type="date"
          onChange={(e) => setDate(e.target.value)}
        />

        <button className="button" onClick={getAvailability}>
          Ver horarios
        </button>

        <div className="slots">
          {slots.map((slot) => (
            <div
              key={slot}
              className="slot"
              onClick={() => setSelectedTime(slot)}
            >
              {slot}
            </div>
          ))}
        </div>

        <input
          className="input"
          placeholder="Tu nombre"
          onChange={(e) => setName(e.target.value)}
        />

        <button className="button" onClick={createAppointment}>
          Reservar turno
        </button>
      </div>
    </div>
  );
}

export default App;