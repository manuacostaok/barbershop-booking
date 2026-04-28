import { useEffect, useState } from "react";
import api from "../api";

function BarberDashboard() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    api.get("/appointments/all").then((res) => {
      const mine = res.data.filter(
        (a) => a.barber?._id === user._id
      );
      setAppointments(mine);
    });
  }, []);

  return (
    <div className="container">
      <div className="card">
        <h2>Mis turnos</h2>

        {appointments.length === 0 ? (
          <p>No tenés turnos</p>
        ) : (
          appointments.map((a) => (
            <div key={a._id} className="row">
              <div>{a.clientName}</div>
              <div>{a.service}</div>
              <div>{a.date}</div>
              <div>{a.time}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default BarberDashboard;