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
    cvv
  } = payload;

  // 1. Registrar pago ligado a una cita
  const [pago] = await db.query(
    `INSERT INTO pagos (id_cita, monto, tipo_pago, metodo_pago)
     VALUES (?, ?, 'COMPLETO', 'TARJETA')`,
    [id_cita, monto]
  );

  // 2. Registrar transacción bancaria
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

  // 3. (Por ahora) Simular envío al banco
  const respuesta = await bancoService.enviarTransaccion(payload);

  return {
    id_pago: pago.insertId,
    id_transaccion_banco: trx.insertId,
    respuesta_banco: respuesta
  };
};

export default { enviarAlBanco };
