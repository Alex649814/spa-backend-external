// src/services/banco.service.js
import axios from "axios";

// Endpoint real de Bancarata
const BANK_API_URL =
  process.env.BANK_API_URL || "https://bancarata.vercel.app/api/bank";

const NOMBRE_COMERCIO =
  process.env.BANCARATA_COMERCIO || "Dreams Kingdom SPA";

const TARJETA_COMERCIO =
  process.env.BANCARATA_TARJETA_COMERCIO || "0000 0009 8765 4321";

const enviarTransaccion = async (solicitud) => {
  const {
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
  } = solicitud;

  // Payload que manda tu backend al banco
  const bodyBanco = {
    NombreComercio: NOMBRE_COMERCIO,
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino: NumeroTarjetaDestino || TARJETA_COMERCIO,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
    Moneda: "MXN",
  };

  const url = BANK_API_URL; // ya trae /api/bank

  console.log("[BANCO] Enviando solicitud a:", url);
  console.log("[BANCO] Body:", bodyBanco);

  // Si aquí truena, dejamos que lance el error para que lo capture el controller
  const { data } = await axios.post(url, bodyBanco);

  console.log("[BANCO] Respuesta REAL:", data);

  const idTransaccion =
    data.IdTransaccion || data.id_transaccion || `TRX-${Date.now()}`;

  // Normalizamos la respuesta a un formato consistente
  return {
    NombreComercio: NOMBRE_COMERCIO,
    CreadaUTC: data.CreadaUTC || new Date().toISOString(),
    IdTransaccion: idTransaccion,
    TipoTransaccion: data.TipoTransaccion || data.tipo_transaccion,
    MontoTransaccion:
      data.MontoTransaccion ?? data.monto ?? data.montoTransaccion ?? Monto,
    Moneda: data.Moneda || data.moneda || "MXN",
    MarcaTarjeta: data.MarcaTarjeta || data.marcaTarjeta,
    NumeroTarjeta: data.NumeroTarjeta || data.numeroTarjeta,
    NumeroAutorizacion:
      data.NumeroAutorizacion || data.numeroAutorizacion || data.Autorizacion,
    NombreEstado: data.NombreEstado || data.nombreEstado,
    Firma: data.Firma || data.firma,
    Mensaje: data.Mensaje || data.mensaje,
  };
};

export default { enviarTransaccion };
