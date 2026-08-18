import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import { LanguageProvider } from "./components/LanguageContext";

import Booking from "./pages/Booking";
import PricingLanding from "./pages/PricingLanding";

import ProtectedRoute from "./components/ProtectedRoute";

// ADMIN LAYOUT + PAGES
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminManagement from "./pages/admin/AdminManagement";
import AdminStats from "./pages/admin/AdminStats";
import AdminConfig from "./pages/admin/AdminConfig";


import ClientLayout from "./layouts/ClientLayout";

import ClientProfile from "./pages/client/ClientProfile";
import ClientNext from "./pages/client/ClientNext";
import ClientBenefits from "./pages/client/ClientBenefits";
import ClientHistory from "./pages/client/ClientHistory";


import BarberLayout from "./layouts/BarberLayout";
import BarberProfile from "./pages/barber/BarberProfile";
import BarberToday from "./pages/barber/BarberToday";
import BarberAppointments from "./pages/barber/BarberAppointments";
import BarberHistory from "./pages/barber/BarberHistory";


function App() {
  return (
    <LanguageProvider>
      <Layout>
        <Routes>

          {/* PUBLIC */}
          <Route path="/" element={<Booking />} />
          <Route path="/planes" element={<PricingLanding />} />

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
                <BarberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<BarberAppointments />} />
            <Route path="today" element={<BarberToday />} />
            <Route path="profile" element={<BarberProfile />} />
          </Route>

          {/* CLIENT */}
          <Route
            path="/client"
            element={
              <ProtectedRoute role="client">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientProfile />} />
            <Route path="next" element={<ClientNext />} />
            <Route path="benefits" element={<ClientBenefits />} />
            <Route path="history" element={<ClientHistory />} />
          </Route>

        </Routes>
      </Layout>
    </LanguageProvider>
  );
}

export default App;