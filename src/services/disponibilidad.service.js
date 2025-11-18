import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

/**
 * Procesa la disponibilidad de un servicio para una fecha/hora.
 * NO inserta cita en BD, solo:
 * - calcula inicio/fin
 * - verifica si hay empleados disponibles
 * - regresa info + el tipo de cabina solicitado (solo informativo)
 */
const procesarDisponibilidad = async (data) => {
  const {
    id_tienda,
    id_servicio_externo,
    fecha_cita,
    hora_cita,
    tipo_cabina // solo lo retornamos, no calculamos disponibilidad por cabina
  } = data;

  if (!tipo_cabina) {
    return {
      disponible: false,
      motivo: "tipo_cabina es obligatorio para verificar disponibilidad"
    };
  }

  // 1. Buscar el servicio
  const [[serv]] = await db.query(
    "SELECT * FROM servicios WHERE id_servicio_externo = ? AND id_tienda = ?",
    [id_servicio_externo, id_tienda]
  );

  if (!serv) {
    return {
      disponible: false,
      motivo: "Servicio no encontrado para esa tienda"
    };
  }

  const dur = serv.duracion_minutos;
  const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

  // 2. Buscar empleado disponible
  const idEmpleado = await buscarEmpleadoDisponible(
    id_tienda,
    fecha_cita,
    hora_cita,
    dur
  );

  if (!idEmpleado) {
    return {
      disponible: false,
      motivo: "No hay empleados disponibles para ese horario"
    };
  }

  // 3. Responder info de disponibilidad (sin insertar cita)
  return {
    disponible: true,
    fecha_inicio: inicio,
    fecha_fin: fin,
    duracion_minutos: dur,
    id_empleado_sugerido: idEmpleado,
    tipo_cabina_solicitada: tipo_cabina
  };
};

export default { procesarDisponibilidad };
