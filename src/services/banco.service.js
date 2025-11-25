// src/services/banco.service.js
import axios from "axios";

const BANK_API_URL =
  process.env.BANK_API_URL || "https://bancarata-bank-api.vercel.app";

const NOMBRE_COMERCIO =
  process.env.BANCARATA_COMERCIO || "Dream’s Kingdom SPA";

const TARJETA_COMERCIO =
  process.env.BANCARATA_TARJETA_COMERCIO || "0000 0009 8765 4321";

const enviarTransaccion = async (solicitud) => {
  const {
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino, // opcional
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto
  } = solicitud;

  const bodyBanco = {
    NombreComercio: NOMBRE_COMERCIO,
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino: NumeroTarjetaDestino || TARJETA_COMERCIO,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
    Moneda: "MXN"
  };

  const url = `${BANK_API_URL}/api/bank`;

  console.log("[BANCO] Enviando solicitud a:", url);
  console.log("[BANCO] Body:", bodyBanco);

  const { data } = await axios.post(url, bodyBanco);

  console.log("[BANCO] Respuesta recibida:", data);

  const idTransaccion =
    data.IdTransaccion || data.id_transaccion || `TRX-${Date.now()}`;

  return {
    NombreComercio: NOMBRE_COMERCIO,
    CreadaUTC: data.CreadaUTC || new Date().toISOString(),
    IdTransaccion: idTransaccion,
    TipoTransaccion: data.TipoTransaccion,
    MontoTransaccion: data.MontoTransaccion ?? Monto,
    Moneda: data.Moneda || "MXN",
    MarcaTarjeta: data.MarcaTarjeta,
    NumeroTarjeta: data.NumeroTarjeta,
    NumeroAutorizacion: data.NumeroAutorizacion,
    NombreEstado: data.NombreEstado,
    Firma: data.Firma,
    Mensaje: data.Mensaje
  };
};

export default { enviarTransaccion };
