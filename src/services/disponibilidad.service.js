// src/services/disponibilidad.service.js
import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

const procesarDisponibilidad = async (data) => {
  console.log("📥 [SERVICE] procesarDisponibilidad - payload:");
  console.log(data);

  const {
    id_tienda,
    id_servicio_externo,
    fecha_cita,
    hora_cita,
    tipo_cabina
  } = data;

  // 1) Validación básica
  if (!id_tienda || !id_servicio_externo || !fecha_cita || !hora_cita) {
    console.log("⚠️ Falta info obligatoria");
    return {
      disponible: false,
      motivo:
        "Faltan campos obligatorios: id_tienda, id_servicio_externo, fecha_cita, hora_cita"
    };
  }

  // 2) Buscar servicio
  const [[serv]] = await db.query(
    `SELECT * FROM servicios
     WHERE id_servicio_externo = ? AND id_tienda = ?`,
    [id_servicio_externo, id_tienda]
  );

  if (!serv) {
    console.log("⚠️ Servicio no encontrado para esa tienda");
    return {
      disponible: false,
      motivo: "Servicio no encontrado para esa tienda"
    };
  }

  const dur = serv.duracion_minutos;

  // 3) Calcular inicio y fin
  const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

  // 4) Buscar empleado disponible
  const idEmpleado = await buscarEmpleadoDisponible(
    id_tienda,
    fecha_cita,
    hora_cita,
    dur
  );

  if (!idEmpleado) {
    console.log("⚠️ No hay empleados disponibles");
    return {
      disponible: false,
      motivo: "No hay empleados disponibles para ese horario"
    };
  }

  const respuesta = {
    disponible: true,
    id_servicio: serv.id_servicio,
    fecha_inicio: inicio,
    fecha_fin: fin,
    duracion_minutos: dur,
    id_empleado_sugerido: idEmpleado,
    tipo_cabina_solicitada: tipo_cabina || null
  };

  console.log("✅ Disponibilidad encontrada:", respuesta);
  return respuesta;
};

export default { procesarDisponibilidad };
