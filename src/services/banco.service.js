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

  // Payload que manda tu backend al banco (nuevo contrato)
  const bodyBanco = {
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino: NumeroTarjetaDestino || TARJETA_COMERCIO,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
  };

  const url = BANK_API_URL;

  console.log("[BANCO] Enviando solicitud a:", url);
  console.log("[BANCO] Body:", bodyBanco);

  const { data } = await axios.post(url, bodyBanco);

  console.log("[BANCO] Respuesta REAL:", data);

  // Normalizamos la respuesta al formato del nuevo contrato
  const descripcion =
    data.Descripcion ||
    data.descripcion ||
    data.Mensaje ||
    data.mensaje ||
    "";

  const idTransaccion =
    data.IdTransaccion ||
    data.id_transaccion ||
    data.idTransaccion ||
    `TRX-${Date.now()}`;

  return {
    // Campos del contrato nuevo
    CreadaUTC: data.CreadaUTC || data.creadaUTC || new Date().toISOString(),
    IdTransaccion: idTransaccion,
    TipoTransaccion:
      data.TipoTransaccion ||
      data.tipoTransaccion ||
      data.tipo_transaccion ||
      "TRANSFERENCIA",
    MontoTransaccion:
      data.MontoTransaccion ??
      data.montoTransaccion ??
      data.monto ??
      Monto,
    NumeroTarjeta: data.NumeroTarjeta || data.numeroTarjeta || null,
    NombreEstado: data.NombreEstado || data.nombreEstado || null,
    Firma: data.Firma || data.firma || null,
    Descripcion: descripcion,

    // Alias para compatibilidad
    Mensaje: descripcion,

    // Opcional: para logs/frontend
    NombreComercio: NOMBRE_COMERCIO,
  };
};

export default { enviarTransaccion };
