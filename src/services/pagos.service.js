// src/services/pagos.service.js
import db from "../db/connection.js";
import bancoService from "./banco.service.js";

const enviarAlBanco = async (payload) => {
  const {
    id_cita,
    monto,
    numero_tarjeta_origen,
    numero_tarjeta_destino,
    nombre_cliente_tarjeta,
    mes_expiracion,
    anio_expiracion,
    cvv,
  } = payload;

  // 1) Registrar pago ligado a la cita, marcándolo como ENVIADO_BANCO
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
      idTransaccionExterna,
    ]
  );

  // 4) Simular el envío al BANCO (aquí luego puedes llamar al microservicio real)
  const respuestaBanco = await bancoService.enviarTransaccion({
    ...payload,
    idTransaccion: idTransaccionExterna,
  });

  // (OPCIONAL) Si quisieras que el banco actualice en el mismo paso:
  // await bancoService.procesarNotificacion(respuestaBanco);

  return {
    id_pago: pago.insertId,
    id_transaccion_banco: trx.insertId,
    id_transaccion_externa: idTransaccionExterna,
    respuesta_banco: respuestaBanco,
  };
};

export default { enviarAlBanco };

