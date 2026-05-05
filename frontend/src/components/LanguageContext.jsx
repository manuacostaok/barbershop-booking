import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext();

/* =========================
   🌍 TRADUCCIONES
========================= */

const translations = {
  es: {
    // GENERAL
    title: "💈 Barber Studio",
    subtitle: "Reservá tu turno en segundos",
    book: "Reservar turno 🚀",
    back: "← Volver",
    confirm: "Confirmar",
    cancel: "Cancelar",
    create: "Crear",
    delete: "Eliminar",
    loading: "Cargando...",
    noData: "No hay datos",

    // NAV
    login: "Iniciar sesión",
    logout: "Cerrar sesión",

    // BOOKING
    services: "Servicios",
    barbers: "Barberos",
    date: "Fecha",
    time: "Horarios",
    name: "Nombre",
    phone: "Teléfono",
    email: "Email",
    password: "Contraseña",
    price: "Precio",
    confirmAppointment: "Confirmar turno 🚀",
    success: "✅ Turno confirmado",

    // ADMIN
    management: "Gestión",
    newBarber: "Nuevo barbero 🧔",
    newService: "Nuevo corte ✂️",
    appointments: "Lista de turnos",
    stats: "Estadísticas",
    filters: "Filtrar turnos",
    all: "Todos",
    selectDate: "Seleccionar fecha",

    // STATUS
    pending: "Pendiente",
    confirmed: "Confirmado",
    cancelled: "Cancelado",

    // ACTIONS
    cancelAppointment: "Cancelar turno",
    deleteAppointment: "Eliminar turno",
    reactivate: "Reactivar",

    // TOASTS
    barberCreated: "Barbero creado ✂️",
    serviceCreated: "Corte creado 💈",
    barberUpdated: "Barbero actualizado ✂️",
    barberDeleted: "Barbero eliminado 🗑️",
    appointmentCancelled: "Turno cancelado ❌",
    appointmentDeleted: "Turno eliminado 🗑️",
    appointmentReactivated: "Turno reactivado ✅",
    error: "Ocurrió un error",

    // MODALS
    confirmDelete: "¿Seguro que querés eliminar?",
    confirmCancel: "¿Seguro que querés cancelar?",
  },

  en: {
    // GENERAL
    title: "💈 Barber Studio",
    subtitle: "Book your appointment in seconds",
    book: "Book now 🚀",
    back: "← Back",
    confirm: "Confirm",
    cancel: "Cancel",
    create: "Create",
    delete: "Delete",
    loading: "Loading...",
    noData: "No data",

    // NAV
    login: "Login",
    logout: "Logout",

    // BOOKING
    services: "Services",
    barbers: "Barbers",
    date: "Date",
    time: "Time",
    name: "Name",
    phone: "Phone",
    email: "Email",
    password: "Password",
    price: "Price",
    confirmAppointment: "Confirm appointment 🚀",
    success: "✅ Appointment confirmed",

    // ADMIN
    management: "Management",
    newBarber: "New barber 🧔",
    newService: "New service ✂️",
    appointments: "Appointments",
    stats: "Statistics",
    filters: "Filter appointments",
    all: "All",
    selectDate: "Select date",

    // STATUS
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",

    // ACTIONS
    cancelAppointment: "Cancel appointment",
    deleteAppointment: "Delete appointment",
    reactivate: "Reactivate",

    // TOASTS
    barberCreated: "Barber created ✂️",
    serviceCreated: "Service created 💈",
    barberUpdated: "Barber updated ✂️",
    barberDeleted: "Barber deleted 🗑️",
    appointmentCancelled: "Appointment cancelled ❌",
    appointmentDeleted: "Appointment deleted 🗑️",
    appointmentReactivated: "Appointment reactivated ✅",
    error: "Something went wrong",

    // MODALS
    confirmDelete: "Are you sure you want to delete?",
    confirmCancel: "Are you sure you want to cancel?",
  },
};

/* =========================
   🧠 PROVIDER
========================= */

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("es");

  // 🔥 cargar idioma guardado
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) setLang(savedLang);
  }, []);

  // 🔥 guardar idioma
  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  // 🔥 toggle
  const toggleLang = () => {
    setLang((prev) => (prev === "es" ? "en" : "es"));
  };

  // 🔥 función tipo i18n real
  const t = (key) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/* =========================
   🪝 HOOK
========================= */

export const useLanguage = () => useContext(LanguageContext);