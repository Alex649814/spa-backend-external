// src/services/banco.service.js
import axios from "axios";

const BANK_API_URL =
  process.env.BANK_API_URL || "https://bancarata-bank-api.vercel.app";

/**
 * ENVÍO REAL AL BANCO BANCARATA
 *
 * Recibe algo así (desde pagos.service):
 * {
 *   NumeroTarjetaOrigen,
 *   NumeroTarjetaDestino,
 *   NombreCliente,
 *   MesExp,
 *   AnioExp,
 *   Cvv,
 *   Monto
 * }
 *
 * Llama a POST BANK_API_URL/api/bank y devuelve la respuesta
 * en un formato uniforme para tu backend.
 */
const enviarTransaccion = async (solicitud) => {
  const {
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto
  } = solicitud;

  // Body EXACTO que espera BANCARATA
  const bodyBanco = {
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto
  };

  const url = `${BANK_API_URL}/api/bank`;

  console.log("[BANCO] Enviando solicitud a:", url);
  console.log("[BANCO] Body:", bodyBanco);

  const { data } = await axios.post(url, bodyBanco);

  console.log("[BANCO] Respuesta recibida:", data);

  // data desde BANCARATA:
  // CreadaUTC, id_transaccion, TipoTransaccion, MontoTransaccion,
  // MarcaTarjeta, NumeroTarjeta, NumeroAutorizacion, NombreEstado, Firma, Mensaje

  const idTransaccion =
    data.IdTransaccion || data.id_transaccion || `TRX-${Date.now()}`;

  // Adaptamos a un formato estándar para el resto del sistema
  return {
    NombreComercio: "Dream’s Kingdom SPA",
    CreadaUTC: data.CreadaUTC,
    IdTransaccion: idTransaccion,
    TipoTransaccion: data.TipoTransaccion,
    MontoTransaccion: data.MontoTransaccion,
    Moneda: "MXN",
    MarcaTarjeta: data.MarcaTarjeta,
    NumeroTarjeta: data.NumeroTarjeta,
    NumeroAutorizacion: data.NumeroAutorizacion,
    NombreEstado: data.NombreEstado,
    Firma: data.Firma,
    Mensaje: data.Mensaje
  };
};

export default { enviarTransaccion };
