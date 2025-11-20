// src/services/banco.service.js
import db from "../db/connection.js";

/**
 * Normaliza una fecha tipo ISO (2025-11-15T21:10:00Z)
 * a formato MySQL DATETIME (2025-11-15 21:10:00).
 */
function normalizarFechaUTC(isoString) {
  if (!isoString) return null;
  // Quitar la Z, cambiar la T por espacio y cortar a 19 caracteres
  return isoString.replace("T", " ").replace("Z", "").slice(0, 19);
}

/**
 * 🔹 PROCESAR NOTIFICACIÓN DEL BANCO
 *
 * Esto es lo que el BANCO te va a mandar a:
 *  POST /api/banco/notificacion
 *
 * Formato esperado (ejemplo):
 * {
 *   "NombreComercio": "Dream’s Kingdom SPA",
 *   "CreadaUTC": "2025-11-15T21:10:00Z",
 *   "IdTransaccion": "TRX-20251115-0005",
 *   "TipoTransaccion": "TRANSFERENCIA",
 *   "MontoTransaccion": 300.00,
 *   "Moneda": "MXN",
 *   "MarcaTarjeta": "VISA",
 *   "NumeroTarjeta": "** ** ** 1111",
 *   "NumeroAutorizacion": "AUTH-849302",
 *   "NombreEstado": "ACEPTADA",
 *   "Firma": "PIN",
 *   "Mensaje": "Pago aprobado"
 * }
 */
const procesarNotificacion = async (data) => {
  const {
    IdTransaccion,     // 🔑 lo usamos para localizar id_transaccion_externa
    TipoTransaccion,
    CreadaUTC,
    NombreComercio,
    NombreEstado,
    Mensaje,
    MarcaTarjeta,
    NumeroTarjeta,
    NumeroAutorizacion,
    Firma
  } = data;

  const creadaMysql = normalizarFechaUTC(CreadaUTC);

  await db.query(
    `UPDATE transacciones_bancarias
     SET
       tipo_transaccion         = ?,
       creada_utc               = ?,
       nombre_comercio          = ?,
       nombre_estado            = ?,
       mensaje                  = ?,
       marca_tarjeta            = ?,
       numero_tarjeta_mascarada = ?,
       numero_autorizacion      = ?,
       firma                    = ?,
       fecha_actualizacion      = NOW()
     WHERE id_transaccion_externa = ?`,
    [
      TipoTransaccion || null,
      creadaMysql,
      NombreComercio || null,
      NombreEstado || null,
      Mensaje || null,
      MarcaTarjeta || null,
      NumeroTarjeta || null,
      NumeroAutorizacion || null,
      Firma || null,
      IdTransaccion // 👈 aquí ligamos con lo que generamos en pagos.service
    ]
  );
};

/**
 * 🔹 SIMULACIÓN DE ENVÍO AL BANCO
 *
 * Esto es lo que TÚ le mandas al banco desde pagos.service:
 *
 * {
 *   "NombreComercio": "Dream’s Kingdom SPA",
 *   "NumeroTarjetaOrigen": "1234 5678 9000 0000",
 *   "NumeroTarjetaDestino": "0000 0009 8765 4321",
 *   "NombreCliente": "Nombre Cliente",
 *   "MesExp": 12,
 *   "AnioExp": 2027,
 *   "Cvv": "123",
 *   "Monto": 750.00,
 *   "Moneda": "MXN",
 *   "idTransaccion": "SPA-1732044000000-5"
 * }
 *
 * Y regresamos algo con el MISMO formato que el banco te dijo.
 */
const enviarTransaccion = async (solicitud) => {
  const {
    NombreComercio,
    NumeroTarjetaOrigen,
    NumeroTarjetaDestino,
    NombreCliente,
    MesExp,
    AnioExp,
    Cvv,
    Monto,
    Moneda,
    idTransaccion
  } = solicitud;

  const ahora = new Date().toISOString();

  const last4 =
    NumeroTarjetaOrigen?.slice(-4) ||
    NumeroTarjetaDestino?.slice(-4) ||
    "0000";

  // Si no viene NombreComercio, usamos el del SPA
  const nombreComercioFinal = NombreComercio || "Dream’s Kingdom SPA";

  return {
    NombreComercio: nombreComercioFinal,
    CreadaUTC: ahora,
    IdTransaccion: idTransaccion || `TRX-${Date.now()}`,
    TipoTransaccion: "TRANSFERENCIA",

    MontoTransaccion: Monto,
    Moneda: Moneda || "MXN",

    MarcaTarjeta: "VISA",
    NumeroTarjeta: "** ** ** " + last4,
    NumeroAutorizacion:
      "AUTH-" +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0"),
    NombreEstado: "ACEPTADA",
    Firma: "PIN",

    Mensaje: "Pago aprobado"
  };
};

export default { procesarNotificacion, enviarTransaccion };
