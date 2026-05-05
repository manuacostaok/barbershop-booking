import { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

const translations = {
  es: {
    title: "💈 Barber Studio",
    subtitle: "Reservá tu turno en segundos",
    book: "Reservar turno 🚀",
    services: "Servicios",
    barbers: "Barberos",
    date: "Fecha",
    time: "Horarios",
    name: "Nombre",
    phone: "Teléfono",
    confirm: "Confirmar turno 🚀",
    success: "✅ Turno confirmado",
    back: "← Volver",
    login: "Iniciar sesión",
    cancel: "Cancelar",
    confirm: "Confirmar",
    create: "Crear",
    newBarber: "💈 Nuevo barbero 🧔",
    newService: "💈 Nuevo corte ✂️",
    name: "Nombre",
    phone: "Teléfono",
    email: "Email",
    password: "Contraseña",
    price: "Precio",
  },
  en: {
    title: "💈 Barber Studio",
    subtitle: "Book your appointment in seconds",
    book: "Book now 🚀",
    services: "Services",
    barbers: "Barbers",
    date: "Date",
    time: "Time",
    name: "Name",
    phone: "Phone",
    confirm: "Confirm appointment 🚀",
    success: "✅ Appointment confirmed",
    back: "← Back",
     login: "Login",
    cancel: "Cancel",
    confirm: "Confirm",
    create: "Create",
    newBarber: "💈 New barber 🧔",
    newService: "💈 New service ✂️",
    name: "Name",
    phone: "Phone",
    email: "Email",
    password: "Password",
    price: "Price",
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("es");

  const toggleLang = () => {
    setLang(prev => (prev === "es" ? "en" : "es"));
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);