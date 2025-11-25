// src/pages/BookingPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext.jsx";
import { verificarDisponibilidad } from "../api/spaApi.js";

function BookingPage() {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, citaInfo, setCitaInfo } = useBooking();

  const [nombreCompleto, setNombreCompleto] = useState(
    citaInfo?.nombreCompleto || ""
  );
  const [fechaCita, setFechaCita] = useState(citaInfo?.fechaCita || "");
  const [horaCita, setHoraCita] = useState(citaInfo?.horaCita || "");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(
    citaInfo?.aceptaPoliticas || false
  );

  const [checking, setChecking] = useState(false);
  const [statusDisponibilidad, setStatusDisponibilidad] = useState(null);
  const [availableTimes, setAvailableTimes] = useState([]);

  // Si no hay carrito, mandamos al inicio
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  // Generar horarios 09:00, 09:30, ..., 20:30
  const generarHorarios = () => {
    const slots = [];
    let hora = 9;
    let minuto = 0;

    while (hora < 21) {
      const hStr = String(hora).padStart(2, "0");
      const mStr = String(minuto).padStart(2, "0");
      slots.push(`${hStr}:${mStr}`);

      minuto += 30;
      if (minuto >= 60) {
        minuto = 0;
        hora += 1;
      }
    }
    return slots;
  };

  const horariosBase = generarHorarios();

  const validarFormularioBasico = () => {
    if (!nombreCompleto.trim()) {
      return "Por favor ingresa el nombre completo.";
    }
    if (!fechaCita) {
      return "Por favor selecciona la fecha de la cita.";
    }
    if (!aceptaPoliticas) {
      return "Debes aceptar las políticas de privacidad y uso.";
    }
    if (!cartItems || cartItems.length === 0) {
      return "Tu carrito está vacío.";
    }
    return null;
  };

  // 🔍 Calcula horarios disponibles para TODOS los servicios del carrito
  const calcularHorariosDisponibles = async (fechaISO) => {
    if (!fechaISO || !cartItems.length) {
      setAvailableTimes([]);
      setStatusDisponibilidad(null);
      return;
    }

    setChecking(true);
    setStatusDisponibilidad(null);
    setAvailableTimes([]);
    setHoraCita("");

    const horariosDisponibles = [];

    for (const hora of horariosBase) {
      let disponibleParaTodos = true;

      for (const item of cartItems) {
        const idServicioExterno =
          item.id_servicio_externo ||
          item.service_external_id ||
          item.id_servicio ||
          item.id ||
          null;

        const payload = {
          id_tienda: 2,
          id_servicio_externo: idServicioExterno,
          fecha_cita: fechaISO,
          hora_cita: hora,
          tipo_cabina: null,
        };

        try {
          const resp = await verificarDisponibilidad(payload);
          console.log("Resp disponibilidad", fechaISO, hora, resp);

          // 💡 Ahora resp.disponible viene bien gracias a spaApi.js
          if (!resp || resp.disponible !== true) {
            disponibleParaTodos = false;
            break;
          }
        } catch (err) {
          console.error("Error verificando disponibilidad:", err);
          disponibleParaTodos = false;
          break;
        }
      }

      if (disponibleParaTodos) {
        horariosDisponibles.push(hora);
      }
    }

    console.log(
      "✅ Horarios disponibles para",
      fechaISO,
      "=>",
      horariosDisponibles
    );

    if (!horariosDisponibles.length) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje: "No hay horarios disponibles para esa fecha.",
      });
    } else {
      setStatusDisponibilidad({
        tipo: "ok",
        mensaje: "Selecciona una hora disponible para completar la reserva.",
      });
    }

    setAvailableTimes(horariosDisponibles);
    setChecking(false);
  };

  // Recalcular horarios cuando cambia la fecha
  useEffect(() => {
    if (fechaCita) {
      calcularHorariosDisponibles(fechaCita);
    } else {
      setAvailableTimes([]);
      setStatusDisponibilidad(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaCita, cartItems]);

  const handleProcederPagar = () => {
    const errorForm = validarFormularioBasico();
    if (errorForm) {
      setStatusDisponibilidad({ tipo: "error", mensaje: errorForm });
      return;
    }
    if (!horaCita) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje: "Selecciona una hora de la lista disponible.",
      });
      return;
    }
    if (!availableTimes.includes(horaCita)) {
      setStatusDisponibilidad({
        tipo: "error",
        mensaje:
          "La hora seleccionada ya no está disponible. Elige otra de la lista.",
      });
      return;
    }

    setCitaInfo({
      nombreCompleto,
      fechaCita,
      horaCita,
      aceptaPoliticas,
    });

    navigate("/pago");
  };

  const handleRegresarCarrito = () => {
    navigate("/carrito");
  };

  if (!cartItems || cartItems.length === 0) return null;

  return (
    <div className="booking-page">
      <h1 className="booking-title">Elementos de pago</h1>

      <div className="booking-layout">
        {/* Izquierda: formulario */}
        <div className="booking-left">
          <div className="booking-field">
            <label>Servicio(s):</label>
            <div className="booking-services-list">
              {cartItems.map((item) => (
                <div key={item.key} className="booking-service-item">
                  <span className="service-name">
                    {item.nombre}
                    {item.cantidad > 1 && ` x${item.cantidad}`}
                  </span>
                  <span className="service-price">
                    MX$ {item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="booking-field">
            <label>Nombre completo:</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              placeholder="¿Quién recibe el tratamiento?"
            />
          </div>

          <div className="booking-field">
            <label>Fecha de la cita:</label>
            <input
              type="date"
              value={fechaCita}
              onChange={(e) => setFechaCita(e.target.value)}
            />
          </div>

          <div className="booking-field">
            <label>Hora de la cita:</label>
            <select
              value={horaCita}
              onChange={(e) => setHoraCita(e.target.value)}
              disabled={!availableTimes.length || checking}
            >
              <option value="">-Seleccionar-</option>
              {availableTimes.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="booking-field booking-checkbox">
            <label>
              <input
                type="checkbox"
                checked={aceptaPoliticas}
                onChange={(e) => setAceptaPoliticas(e.target.checked)}
              />
              <span>Acepto las políticas de privacidad y uso.</span>
            </label>
          </div>

          {statusDisponibilidad && (
            <div
              className={
                statusDisponibilidad.tipo === "ok"
                  ? "disponibilidad-message ok"
                  : "disponibilidad-message error"
              }
            >
              {statusDisponibilidad.mensaje}
            </div>
          )}

          <div className="booking-buttons-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRegresarCarrito}
              disabled={checking}
            >
              Regresar al carrito
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleProcederPagar}
              disabled={checking || !availableTimes.length}
            >
              {checking ? "Verificando..." : "Proceder a pagar"}
            </button>
          </div>
        </div>

        {/* Derecha: resumen */}
        <div className="booking-right">
          <h2>Resumen de la reserva</h2>
          <div className="booking-summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>MX$ {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Cupón de descuento</span>
              <span>—</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>MX$ {cartSubtotal.toFixed(2)}</span>
            </div>

            <div className="summary-extra">
              {fechaCita && horaCita ? (
                <p>
                  <strong>Fecha y hora seleccionadas:</strong>{" "}
                  {fechaCita} — {horaCita}
                </p>
              ) : fechaCita ? (
                <p>Selecciona una hora disponible para completar la reserva.</p>
              ) : (
                <p>Selecciona fecha y hora para ver el resumen completo.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
