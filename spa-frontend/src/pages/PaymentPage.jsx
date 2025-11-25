import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext.jsx";
import { solicitarPago } from "../api/spaApi.js";
import "./PaymentPage.css";

function PaymentPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    cartSubtotal,
    citaInfo,
    setPagoInfo,
    clearCart,
  } = useBooking();

  // --- Campos de tarjeta ---
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvv, setCvv] = useState("");

  // --- Campos nuevos para comprobante ---
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Si no hay carrito o no hay cita básica, regresamos
  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/");
      return;
    }
    if (!citaInfo || !citaInfo.fechaCita || !citaInfo.horaCita) {
      // que primero llenen la info en /reserva
      navigate("/reserva");
    }
  }, [cartItems, citaInfo, navigate]);

  const validarFormulario = () => {
    const sanitizedCard = cardNumber.replace(/\s+/g, "");

    if (!sanitizedCard) return "Ingresa el número de la tarjeta.";
    if (sanitizedCard.length < 13 || sanitizedCard.length > 19) {
      return "Ingresa un número de tarjeta válido.";
    }

    if (!cardName.trim())
      return "Ingresa el nombre del titular de la tarjeta.";

    if (!expMonth || !expYear) return "Ingresa la fecha de vencimiento.";
    const mes = Number(expMonth);
    const anio = Number(expYear);
    if (mes < 1 || mes > 12) return "El mes de vencimiento no es válido.";
    if (!anio || anio < new Date().getFullYear()) {
      return "El año de vencimiento no es válido.";
    }

    if (!cvv.trim()) return "Ingresa el CVV.";
    if (cvv.length < 3 || cvv.length > 4) return "El CVV no es válido.";

    if (!email.trim()) return "Ingresa tu correo electrónico.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return "Ingresa un correo electrónico válido.";

    if (!phone.trim()) return "Ingresa tu número de teléfono.";
    const digitsPhone = phone.replace(/\D/g, "");
    if (digitsPhone.length < 8)
      return "Ingresa un número de teléfono válido.";

    if (!citaInfo?.fechaCita || !citaInfo?.horaCita)
      return "Falta la fecha u hora de la cita.";
    if (!cartItems || cartItems.length === 0) return "El carrito está vacío.";

    return null;
  };

  const handlePagar = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const err = validarFormulario();
    if (err) {
      setErrorMsg(err);
      return;
    }

    // Número de tarjeta sin espacios para mandar al backend/banco
    const sanitizedCard = cardNumber.replace(/\s+/g, "");

    // 👉 Payload de PRUEBA para enviar a tu backend
    // (sigue el formato del banco como lo estás usando ahorita)
    const payload = {
      NombreComercio: "Dream’s Kingdom SPA",
      NumeroTarjetaOrigen: sanitizedCard,
      NumeroTarjetaDestino: "0000 0009 8765 4321", // cuenta del SPA
      NombreCliente: cardName || citaInfo?.nombreCompleto,
      MesExp: Number(expMonth),
      AnioExp: Number(expYear),
      Cvv: cvv,
      Monto: Number(cartSubtotal.toFixed(2)),
      Moneda: "MXN",
      Email: email,
      Telefono: phone,
    };

    try {
      setLoading(true);
      console.log("💳 Enviando pago a backend:", payload);

      const resp = await solicitarPago(payload);
      console.log("💳 Respuesta del backend/banco:", resp);

      // Lógica de aprobación: añadimos lo que esperas de ejemplo
      const isApproved =
        resp?.NombreEstado === "ACEPTADA" ||
        resp?.NombreEstado === "APROBADA" ||
        resp?.Mensaje === "Pago aprobado" ||
        resp?.aprobado === true ||
        resp?.estatus === "APROBADA" ||
        resp?.status === "APPROVED" ||
        !!resp?.codigoAutorizacion ||
        !!resp?.AuthorizationCode;

      if (!isApproved) {
        const msg =
          resp?.Mensaje ||
          resp?.mensaje ||
          resp?.motivo ||
          "El banco rechazó la transacción. Verifica los datos.";
        setErrorMsg(msg);
        return;
      }

      // Guardar info de pago en el contexto (útil para el comprobante)
      setPagoInfo({
        ...resp,
        email,
        telefono: phone,
        citaInfo,
        items: cartItems,
        total: Number(cartSubtotal.toFixed(2)),
      });

      setSuccessMsg("Pago aprobado correctamente. ¡Gracias!");
      setErrorMsg("");

      // Por ahora, solo limpiamos el carrito y mandamos a inicio después de unos segundos
      setTimeout(() => {
        clearCart();
        navigate("/");
      }, 2500);
    } catch (err) {
      console.error("Error al procesar el pago:", err);
      setErrorMsg(
        "Ocurrió un error al procesar el pago. Intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  return (
    <div className="payment-page">
      <h1 className="payment-title">Pago con tarjeta</h1>

      <div className="payment-layout">
        {/* Izquierda: formulario de tarjeta */}
        <div className="payment-left">
          <div className="payment-card-visual">
            <div className="card-logo">BANK</div>
            <div className="card-number-preview">
              {cardNumber || "•••• •••• •••• ••••"}
            </div>
            <div className="card-row">
              <div className="card-holder">
                <span>Card holder</span>
                <strong>{cardName || "NOMBRE DEL TITULAR"}</strong>
              </div>
              <div className="card-exp">
                <span>Expires</span>
                <strong>
                  {expMonth || "MM"}/
                  {expYear ? expYear.toString().slice(-2) : "AA"}
                </strong>
              </div>
            </div>
          </div>

          <div className="payment-form">
            <div className="payment-field">
              <label>Número de tarjeta</label>
              <input
                type="text"
                name="fake-card-number"
                placeholder="1234 5678 9000 0000"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                autoComplete="off"       // ayuda a que el navegador no intervenga tanto
                inputMode="numeric"
              />
            </div>

            <div className="payment-field">
              <label>Nombre del titular</label>
              <input
                type="text"
                placeholder="Como aparece en la tarjeta"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div className="payment-row">
              <div className="payment-field small">
                <label>Mes</label>
                <input
                  type="number"
                  placeholder="MM"
                  min="1"
                  max="12"
                  value={expMonth}
                  onChange={(e) => setExpMonth(e.target.value)}
                />
              </div>
              <div className="payment-field small">
                <label>Año</label>
                <input
                  type="number"
                  placeholder="2027"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                />
              </div>
              <div className="payment-field small">
                <label>CVV</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Nuevos campos para comprobante */}
            <div className="payment-field">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="payment-field">
              <label>Teléfono de contacto</label>
              <input
                type="tel"
                placeholder="662 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
              />
            </div>

            {errorMsg && (
              <div className="payment-message error">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="payment-message success">{successMsg}</div>
            )}

            <button
              type="button"
              className="btn-primary payment-btn"
              onClick={handlePagar}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Pagar ahora"}
            </button>
          </div>
        </div>

        {/* Derecha: resumen de pedido + cita */}
        <div className="payment-right">
          <h2>Resumen de la compra</h2>

          <div className="payment-summary-box">
            <div className="summary-services">
              {cartItems.map((item) => (
                <div key={item.key} className="summary-service-item">
                  <div>
                    <span className="service-name">{item.nombre}</span>
                    {item.cantidad > 1 && (
                      <span className="service-qty"> x{item.cantidad}</span>
                    )}
                  </div>
                  <div className="service-total">
                    MX$ {item.total.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider" />

            <div className="summary-row">
              <span>Subtotal</span>
              <span>MX$ {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Cupón</span>
              <span>—</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total a pagar</span>
              <span>MX$ {cartSubtotal.toFixed(2)}</span>
            </div>

            {citaInfo && (
              <div className="summary-extra">
                <p>
                  <strong>Fecha de la cita:</strong> {citaInfo.fechaCita}
                </p>
                <p>
                  <strong>Hora de la cita:</strong> {citaInfo.horaCita}
                </p>
                <p>
                  <strong>Cliente:</strong> {citaInfo.nombreCompleto}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn-secondary payment-back-btn"
            onClick={() => navigate("/reserva")}
            disabled={loading}
          >
            Volver a reserva
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
