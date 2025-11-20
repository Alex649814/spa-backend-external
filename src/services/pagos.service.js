// src/services/pagos.service.js
import db from "../db/connection.js";
import bancoService from "./banco.service.js";

/**
 * Envía una solicitud de pago al banco a partir de una cita.
 *
 * 1) Registra el pago en la tabla `pagos`
 * 2) Crea el registro en `transacciones_bancarias`
 * 3) Llama al servicio del banco (simulado) para obtener la respuesta
 * 4) Regresa al Mall:
 *    - id_pago
 *    - id_transaccion_banco
 *    - id_transaccion_externa
 *    - respuesta_banco (JSON con los campos que el banco maneja)
 */
const enviarAlBanco = async (payload) => {
  const {
    id_cita,
    monto,
    numero_tarjeta_origen,
    numero_tarjeta_destino,
    nombre_cliente_tarjeta,
    mes_expiracion,
    anio_expiracion,
    cvv
  } = payload;

  // 🔎 Validaciones mínimas
  if (!id_cita || !monto) {
    throw new Error("id_cita y monto son obligatorios para solicitar el pago");
  }

  if (!numero_tarjeta_origen || !numero_tarjeta_destino) {
    throw new Error("Los números de tarjeta origen y destino son obligatorios");
  }

  // 1) Registrar el pago ligado a la cita
  const [pago] = await db.query(
    `INSERT INTO pagos (id_cita, monto, tipo_pago, metodo_pago, estatus)
     VALUES (?, ?, 'COMPLETO', 'TARJETA', 'ENVIADO_BANCO')`,
    [id_cita, monto]
  );

  // 2) Generar un id de transacción externa que usará el BANCO
  const idTransaccionExterna = `SPA-${Date.now()}-${pago.insertId}`;

  // 3) Registrar transacción bancaria, incluyendo id_transaccion_externa
  const [trx] = await db.query(
    `INSERT INTO transacciones_bancarias (
        id_pago,
        numero_tarjeta_origen,
        numero_tarjeta_destino,
        nombre_cliente_tarjeta,
        mes_expiracion,
        anio_expiracion,
        cvv,
        monto,
        moneda,
        id_transaccion_externa
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MXN', ?)`,
    [
      pago.insertId,
      numero_tarjeta_origen,
      numero_tarjeta_destino,
      nombre_cliente_tarjeta,
      mes_expiracion,
      anio_expiracion,
      cvv,
      monto,
      idTransaccionExterna
    ]
  );

  // 4) Simular el envío al BANCO.
  //    Aquí todavía no pegamos al banco real, usamos bancoService.enviarTransaccion
  const respuestaBanco = await bancoService.enviarTransaccion({
    // 👇 Lo que el banco espera en su "solicitud de banco"
    NombreComercio: "Dream’s Kingdom SPA",

    NumeroTarjetaOrigen: numero_tarjeta_origen,
    NumeroTarjetaDestino: numero_tarjeta_destino,

    NombreCliente: nombre_cliente_tarjeta,
    MesExp: mes_expiracion,
    AnioExp: anio_expiracion,
    Cvv: cvv,

    Monto: monto,
    Moneda: "MXN",

    // Además seguimos pasando el idTransaccion para ligarlo
    idTransaccion: idTransaccionExterna
  });

  return {
    id_pago: pago.insertId,
    id_transaccion_banco: trx.insertId,
    id_transaccion_externa: idTransaccionExterna,
    respuesta_banco: respuestaBanco
  };
};

export default { enviarAlBanco };
