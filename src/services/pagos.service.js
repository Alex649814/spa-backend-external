// src/services/pagos.service.js
import db from "../db/connection.js";
import bancoService from "./banco.service.js";

/**
 * Envía una solicitud de pago al banco a partir de una cita.
 *
 * 1) Registra el pago en la tabla `pagos`
 * 2) Crea el registro en `transacciones_bancarias`
 * 3) Llama a la API del banco (BANCARATA)
 * 4) Actualiza `transacciones_bancarias` con la respuesta real del banco
 * 5) Actualiza estatus de `pagos` y `citas`
 * 6) Regresa:
 *    - id_pago
 *    - id_transaccion_banco
 *    - id_transaccion_externa (id del banco)
 *    - respuesta_banco
 *    - estatus_pago
 *    - estatus_cita
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
    throw new Error(
      "Los números de tarjeta origen y destino son obligatorios"
    );
  }

  // 1) Registrar el pago ligado a la cita
  const [pago] = await db.query(
    `INSERT INTO pagos (id_cita, monto, tipo_pago, metodo_pago, estatus)
     VALUES (?, ?, 'COMPLETO', 'TARJETA', 'ENVIADO_BANCO')`,
    [id_cita, monto]
  );

  // 2) Registrar transacción bancaria (lo que ENVIAMOS al banco)
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
        moneda
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'MXN')`,
    [
      pago.insertId,
      numero_tarjeta_origen,
      numero_tarjeta_destino,
      nombre_cliente_tarjeta,
      mes_expiracion,
      anio_expiracion,
      cvv,
      monto
    ]
  );

  // 3) Llamar al BANCO real (BANCARATA)
  const respuestaBanco = await bancoService.enviarTransaccion({
    NumeroTarjetaOrigen: numero_tarjeta_origen,
    NumeroTarjetaDestino: numero_tarjeta_destino,
    NombreCliente: nombre_cliente_tarjeta,
    MesExp: mes_expiracion,
    AnioExp: anio_expiracion,
    Cvv: cvv,
    Monto: monto
  });

  // 4) Actualizar la transacción bancaria con los datos del banco
  const creadaMysql = respuestaBanco.CreadaUTC
    ? respuestaBanco.CreadaUTC.replace("T", " ").replace("Z", "").slice(0, 19)
    : null;

  const idTransaccionBanco =
    respuestaBanco.IdTransaccion || respuestaBanco.id_transaccion || null;

  await db.query(
    `UPDATE transacciones_bancarias
     SET
       tipo_transaccion         = ?,
       creada_utc               = ?,
       nombre_comercio          = ?,
       id_transaccion_externa   = ?,
       marca_tarjeta            = ?,
       numero_tarjeta_mascarada = ?,
       numero_autorizacion      = ?,
       nombre_estado            = ?,
       firma                    = ?,
       mensaje                  = ?,
       fecha_actualizacion      = NOW()
     WHERE id_transaccion_banco = ?`,
    [
      respuestaBanco.TipoTransaccion || null,
      creadaMysql,
      respuestaBanco.NombreComercio || "Dream’s Kingdom SPA",
      idTransaccionBanco,
      respuestaBanco.MarcaTarjeta || null,
      respuestaBanco.NumeroTarjeta || null,
      respuestaBanco.NumeroAutorizacion || null,
      respuestaBanco.NombreEstado || null,
      respuestaBanco.Firma || null,
      respuestaBanco.Mensaje || null,
      trx.insertId
    ]
  );

  // 5) Actualizar estatus del pago y de la cita según respuesta del banco
  const estadoBanco = (respuestaBanco.NombreEstado || "").toUpperCase();
  const aprobada = estadoBanco === "ACEPTADA";

  const nuevoEstatusPago = aprobada ? "APROBADO" : "RECHAZADO";
  await db.query(
    `UPDATE pagos
     SET estatus = ?, actualizado_en = NOW()
     WHERE id_pago = ?`,
    [nuevoEstatusPago, pago.insertId]
  );

  const nuevoEstatusCita = aprobada ? "CONFIRMADA" : "CANCELADA";
  await db.query(
    `UPDATE citas
     SET estatus = ?, actualizado_en = NOW()
     WHERE id_cita = ?`,
    [nuevoEstatusCita, id_cita]
  );

  // 6) Regresar info al frontend
  return {
    id_pago: pago.insertId,
    id_transaccion_banco: trx.insertId,
    id_transaccion_externa: idTransaccionBanco,
    respuesta_banco: respuestaBanco,
    estatus_pago: nuevoEstatusPago,
    estatus_cita: nuevoEstatusCita
  };
};

export default { enviarAlBanco };
