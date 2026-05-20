import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import { LanguageProvider } from "./components/LanguageContext";
import Booking from "./pages/Booking";
import AdminPanel from "./pages/AdminPanel";
import BarberDashboard from "./pages/BarberDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientPanel from "./pages/ClientPanel";

function App() {
  return (
    <LanguageProvider>
      <Layout>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Booking />} />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* BARBER */}
          <Route
            path="/barber"
            element={
              <ProtectedRoute role="barber">
                <BarberDashboard />
              </ProtectedRoute>
            }
          />

          {/* CLIENT */}
          <Route
            path="/client"
            element={
              <ProtectedRoute role="client">
                <ClientPanel />
              </ProtectedRoute>
            }
          />

        </Routes>
      </Layout>
    </LanguageProvider>
  );
}

export default App;