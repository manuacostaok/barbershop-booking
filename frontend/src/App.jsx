import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import { LanguageProvider } from "./components/LanguageContext";

import Booking from "./pages/Booking";
import BarberDashboard from "./pages/BarberDashboard";
import ClientPanel from "./pages/ClientPanel";

import ProtectedRoute from "./components/ProtectedRoute";

// ADMIN LAYOUT + PAGES
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminStats from "./pages/admin/AdminStats";
import AdminConfig from "./pages/admin/AdminConfig";

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
                <AdminLayout />
              </ProtectedRoute>
            }
          >

            {/* 🔥 ESTO ES LO IMPORTANTE DEL PASO 7 */}
            <Route index element={<AdminDashboard />} />

            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="management" element={<AdminManagement />} />
            <Route path="stats" element={<AdminStats />} />
            <Route path="config" element={<AdminConfig />} />

          </Route>

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