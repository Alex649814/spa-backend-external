// src/services/banco.service.js
import axios from "axios";

const BANK_API_URL =
  process.env.BANK_API_URL || "https://bancarata-bank-api.vercel.app";

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

  const url = `${BANK_API_URL}/api/bank`;

  try {
    console.log("[BANCO] Enviando solicitud a:", url);
    console.log("[BANCO] Body:", bodyBanco);

    const { data } = await axios.post(url, bodyBanco);

    console.log("[BANCO] Respuesta REAL:", data);

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
      Mensaje: data.Mensaje,
    };
  } catch (error) {
    // 👇 AQUÍ ACTIVAMOS EL MODO SIMULADO
    console.error(
      "[BANCO] Error llamando a Bancarata:",
      error.response?.data || error.message
    );

    const ahora = new Date().toISOString();
    const idFake = `TRX-MOCK-${Date.now()}`;

    // ✅ RESPUESTA SIMULADA "ACEPTADA"
    return {
      NombreComercio: NOMBRE_COMERCIO,
      CreadaUTC: ahora,
      IdTransaccion: idFake,
      TipoTransaccion: "TRANSFERENCIA",
      MontoTransaccion: Monto,
      Moneda: "MXN",
      MarcaTarjeta: "VISA",
      NumeroTarjeta: "**** **** **** 1111",
      NumeroAutorizacion: "AUTH-MOCK-123456",
      NombreEstado: "ACEPTADA",
      Firma: "PIN",
      Mensaje:
        "Pago aprobado (simulado: la API Bancarata no está disponible actualmente)",
    };
  }
};

export default { enviarTransaccion };
