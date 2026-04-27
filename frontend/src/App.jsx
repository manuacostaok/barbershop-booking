import { BrowserRouter, Routes, Route } from "react-router-dom";
import Booking from "./pages/Booking";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;