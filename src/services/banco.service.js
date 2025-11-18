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
      idTransaccion
    ]
  );
};

const enviarTransaccion = async (data) => {
  return { mensaje: "Simulación de envío al banco" };
};

export default { procesarNotificacion, enviarTransaccion };



