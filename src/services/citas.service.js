// src/services/citas.service.js
import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

/**
 * Registrar venta proveniente del MALL.
 * - Crea/obtiene el cliente
 * - Busca el servicio
 * - Asigna empleado disponible
 * - Crea la cita
 * - Genera código de reserva
 * - Guarda el tipo de cabina elegida por el cliente como texto
 */
const registrarVenta = async (data) => {
  const {
    id_tienda,
    id_usuario_mall,
    id_servicio_externo,
    nombre_cliente,
    correo,
    telefono,
    fecha_cita,
    hora_cita,
    tipo_cabina // 👈 viene del front: "Sencilla", "Doble", etc.
  } = data;

  if (!tipo_cabina) {
    throw new Error("tipo_cabina es obligatorio para registrar la venta");
  }

  // 1. Buscar o crear cliente por correo
  const [[cli]] = await db.query(
    "SELECT * FROM clientes WHERE correo = ?",
    [correo]
  );

  let idCliente = cli ? cli.id_cliente : null;

  if (!idCliente) {
    const [n] = await db.query(
  "INSERT INTO clientes (id_tienda, id_usuario_mall, nombre_completo, correo, telefono) VALUES (?,?,?,?,?)",
    [id_tienda, id_usuario_mall, nombre_cliente, correo, telefono]
    );
    idCliente = n.insertId;
  }

  // 2. Buscar servicio por id_servicio_externo
  const [[serv]] = await db.query(
    "SELECT * FROM servicios WHERE id_servicio_externo = ? AND id_tienda = ?",
    [id_servicio_externo, id_tienda]
  );

  if (!serv) {
    throw new Error("Servicio no encontrado para esa tienda");
  }

  const dur = serv.duracion_minutos;
  const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

  // 3. Buscar empleado disponible
  const idEmpleado = await buscarEmpleadoDisponible(
    id_tienda,
    fecha_cita,
    hora_cita,
    dur
  );

  if (!idEmpleado) {
    throw new Error("No hay empleados disponibles para ese horario");
  }

  // 4. Crear la cita (sin usar id_cabina, pero guardando tipo_cabina_reservada)
  const horaNormalizada = hora_cita.length === 5 ? `${hora_cita}:00` : hora_cita;

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
        tipo_cabina_reservada,
        origen,
        estatus
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?, 'MALL','PENDIENTE_PAGO')`,
    [
      id_tienda,
      serv.id_servicio,
      idCliente,
      null,             // id_cabina (no lo usamos por ahora)
      idEmpleado,
      fecha_cita,
      horaNormalizada,
      inicio,
      fin,
      dur,
      tipo_cabina       // 👈 guardamos texto: "Sencilla", "Doble", etc.
    ]
  );

  // 5. Generar y guardar código de reserva
  const codigoReserva = `SPA-${fecha_cita.replace(/-/g, "")}-${cita.insertId}`;

  await db.query(
    "UPDATE citas SET codigo_reserva = ? WHERE id_cita = ?",
    [codigoReserva, cita.insertId]
  );

  // 6. Respuesta para el Mall
  return {
    mensaje: "Venta registrada correctamente",
    id_cita: cita.insertId,
    codigo_reserva: codigoReserva,
    fecha_inicio: inicio,
    fecha_fin: fin,
    duracion_minutos: dur,
    id_empleado: idEmpleado,
    tipo_cabina_reservada: tipo_cabina
  };
};

export default { registrarVenta };
