import { BrowserRouter, Routes, Route } from "react-router-dom";
import Booking from "./pages/Booking";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import BarberDashboard from "./pages/BarberDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Booking />} />

        {/* 🔐 LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 ADMIN PROTEGIDO */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
          }
        />
        {/* 🔒 crear barber PROTEGIDO */}

        <Route
          path="/barber"
          element={
            <ProtectedRoute role="barber">
              <BarberDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;