// src/context/BookingContext.jsx
import { createContext, useContext, useState } from "react";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedService, setSelectedService] = useState(null); // servicio elegido
  const [citaInfo, setCitaInfo] = useState(null);               // respuesta de /web
  const [pagoInfo, setPagoInfo] = useState(null);               // respuesta de /pagos

  const value = {
    selectedService,
    setSelectedService,
    citaInfo,
    setCitaInfo,
    pagoInfo,
    setPagoInfo
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking debe usarse dentro de <BookingProvider>");
  }
  return ctx;
}
