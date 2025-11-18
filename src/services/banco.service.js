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
 * Procesa la notificación que envía el BANCO.
 */
const procesarNotificacion = async (data) => {
  const {
    idTransaccion,        // TRX-...
    TipoTransaccion,      // TRANSFERENCIA, etc.
    CreadaUTC,            // "2025-11-15T21:10:00Z"
    NombreComercio,       // "Dreams Kingdom SPA"

    nombreEstado,         // ACEPTADA / RECHAZADA
    Mensaje,              // "Pago aprobado"

    MarcaTarjeta,         // VISA, MASTERCARD...
    NumeroTarjeta,        // **** **** **** 0000
    NumeroAutorizacion,   // AUTH-123456
    Firma                 // PIN / FIRMA / etc.
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
      nombreEstado || null,
      Mensaje || null,
      MarcaTarjeta || null,
      NumeroTarjeta || null,
      NumeroAutorizacion || null,
      Firma || null,
      idTransaccion,
    ]
  );
};

/**
 * Simulación de envío al banco:
 * genera un objeto con el mismo formato que usaría procesarNotificacion.
 */
const enviarTransaccion = async (data) => {
  const ahora = new Date().toISOString();

  const last4 =
    data.numero_tarjeta_origen?.slice(-4) ||
    data.numero_tarjeta_destino?.slice(-4) ||
    "0000";

  const idTransaccion =
    data.idTransaccion || `TRX-${Date.now()}`; // por si viene desde pagos.service

  return {
    idTransaccion,
    TipoTransaccion: "TRANSFERENCIA",
    CreadaUTC: ahora,
    NombreComercio: "Servicios SPA Mall",
    nombreEstado: "ACEPTADA",
    Mensaje: "Pago aprobado",
    MarcaTarjeta: "VISA",
    NumeroTarjeta: "**** **** **** " + last4,
    NumeroAutorizacion:
      "AUTH-" +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0"),
    Firma: "PIN",
  };
};

export default { procesarNotificacion, enviarTransaccion };



