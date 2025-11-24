import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

const registrarVenta = async (payload) => {
  const {
    // de la matriz
    id: mallOrderId,
    user_id,
    store_id,
    service_external_id,
    service_name,
    service_description,
    service_price,
    apointment_date,
    apointment_time,
    appointment_date,
    appointment_time,
    duration_minutes,
    payment_status,
    payment_method,
    confirmation_code_created_at,

    // AÚN NO LOS ENVÍAN — QUEDAN COMENTADOS
    // customer_name,
    // customer_email,
    // customer_phone
  } = payload;

  const id_tienda = store_id;
  const fecha_cita = apointment_date || appointment_date;
  const hora_cita = apointment_time || appointment_time;
  const durFromBody = duration_minutes ? Number(duration_minutes) : null;

  if (!user_id || !id_tienda || !service_external_id || !fecha_cita || !hora_cita) {
    throw new Error(
      "Faltan datos obligatorios para registrar la venta (user_id, store_id, service_external_id, apointment_date, apointment_time)"
    );
  }

  // Datos de cliente (temporales, mientras no mandan nombre/correo/teléfono)
  const nombreCliente = `Cliente Mall ${user_id}`;
  const correo = null;     // customer_email || null;
  const telefono = null;   // customer_phone || null;

  // 1. Buscar o crear cliente por (id_tienda, id_usuario_mall)
  const [[cli]] = await db.query(
    "SELECT * FROM clientes WHERE id_tienda = ? AND id_usuario_mall = ?",
    [id_tienda, user_id]
  );

  let idCliente = cli ? cli.id_cliente : null;

  if (!idCliente) {
    const [n] = await db.query(
      "INSERT INTO clientes (id_tienda, id_usuario_mall, nombre_completo, correo, telefono) VALUES (?,?,?,?,?)",
      [id_tienda, user_id, nombreCliente, correo, telefono]
    );
    idCliente = n.insertId;
  }

  // 2. Buscar servicio
  const [[serv]] = await db.query(
    "SELECT * FROM servicios WHERE id_servicio_externo = ? AND id_tienda = ?",
    [service_external_id, id_tienda]
  );

  if (!serv) {
    throw new Error("Servicio no encontrado para esa tienda");
  }

  const dur = durFromBody && durFromBody > 0
    ? durFromBody
    : serv.duracion_minutos;

  const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

  // 3. Asignar empleado disponible
  const idEmpleado = await buscarEmpleadoDisponible(
    id_tienda,
    fecha_cita,
    hora_cita,
    dur
  );

  if (!idEmpleado) {
    throw new Error("No hay empleados disponibles para ese horario");
  }

  // 4. Determinar estatus inicial según payment_status
  let estatusCita = "PENDIENTE_PAGO";
  if (payment_status) {
    const s = String(payment_status).toUpperCase();
    if (["PAGADO", "PAGADA", "ACEPTADA", "APROBADA"].includes(s)) {
      estatusCita = "CONFIRMADA";
    } else if (["RECHAZADA", "CANCELADA"].includes(s)) {
      estatusCita = "CANCELADA";
    }
  }

  // 5. Crear la cita
  const horaNormalizada =
    hora_cita.length === 5 ? `${hora_cita}:00` : hora_cita;

  const [cita] = await db.query(
    `INSERT INTO citas (
        id_tienda,
        id_servicio,
        id_cliente,
        id_cabina,
        id_empleado,
        fecha_cita,
        hora_cita,
        fecha_inicio,
        fecha_fin,
        duracion_minutos,
        origen,
        estatus
      )
      VALUES (?,?,?,?,?,?,?,?,?,?, 'MALL', ?)`,
    [
      id_tienda,
      serv.id_servicio,
      idCliente,
      null,
      idEmpleado,
      fecha_cita,
      horaNormalizada,
      inicio,
      fin,
      dur,
      estatusCita
    ]
  );

  // 6. Generar y guardar código de reserva
  const codigoReserva = `SPA-${fecha_cita.replace(/-/g, "")}-${cita.insertId}`;

  await db.query(
    "UPDATE citas SET codigo_reserva = ? WHERE id_cita = ?",
    [codigoReserva, cita.insertId]
  );

  // No es necesario devolver nada por ahora; el controller solo responde un mensaje.
};



const crearCitaWeb = async (data) => {
  const {
    store_id,
    service_external_id,
    customer_name,
    customer_email,
    customer_phone,
    appointment_date,
    appointment_time,
    tipo_cabina
  } = data;

  // 1) Buscar servicio spa
  const [serv] = await db.query(
    "SELECT id_servicio, duracion_minutos FROM servicios WHERE id_servicio_externo = ? AND id_tienda = ?",
    [service_external_id, store_id]
  );

  if (!serv.length) {
    throw new Error("Servicio no encontrado");
  }

  const servicio = serv[0];

  // 2) Buscar o crear cliente
  const [clientRows] = await db.query(
    "SELECT id_cliente FROM clientes WHERE correo = ? AND id_tienda = ?",
    [customer_email, store_id]
  );

  let id_cliente;

  if (clientRows.length) {
    id_cliente = clientRows[0].id_cliente;
  } else {
    const [insertCliente] = await db.query(
      `INSERT INTO clientes (id_tienda, nombre_completo, correo, telefono)
       VALUES (?, ?, ?, ?)`,
      [store_id, customer_name, customer_email, customer_phone]
    );
    id_cliente = insertCliente.insertId;
  }

  // 3) Calcular fechas
  const fechaInicio = `${appointment_date} ${appointment_time}`;
  const fechaFin = new Date(fechaInicio);
  fechaFin.setMinutes(fechaFin.getMinutes() + servicio.duracion_minutos);

  // 4) Registrar la cita
  const [cita] = await db.query(
    `INSERT INTO citas (
        id_tienda,
        id_servicio,
        id_cliente,
        fecha_cita,
        hora_cita,
        fecha_inicio,
        fecha_fin,
        duracion_minutos,
        tipo_cabina_reservada,
        estatus,
        origen
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE_PAGO', 'SPA_WEB')`,
    [
      store_id,
      servicio.id_servicio,
      id_cliente,
      appointment_date,
      appointment_time,
      fechaInicio,
      fechaFin,
      servicio.duracion_minutos,
      tipo_cabina
    ]
  );

  return {
    id_cita: cita.insertId,
    fecha_inicio: fechaInicio,
    fecha_fin: fechaFin,
    duracion: servicio.duracion_minutos
  };
};

export default {
  registrarVenta,
  registrarVentaMall,
  crearCitaWeb   // 👈 AGREGA ESTA LÍNEA
};




