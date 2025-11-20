// src/services/disponibilidad.service.js
import db from "../db/connection.js";
import {
  buscarEmpleadoDisponible,
  calcularRangoFechaHora
} from "./asignacion.service.js";

const procesarDisponibilidad = async (data) => {
  console.log("📥 [MALL] Datos recibidos en /disponibilidad");
  console.log(data);

  const {
    id_tienda,
    id_servicio_externo,
    fecha_cita,
    hora_cita,
    tipo_cabina
  } = data;

  // Validación obligatoria mínima según el mall
  if (!id_tienda || !id_servicio_externo || !fecha_cita || !hora_cita) {
    return {
      disponible: false,
      motivo:
        "Faltan campos obligatorios: id_tienda, id_servicio_externo, fecha_cita, hora_cita"
    };
  }

  // 1. Buscar el servicio
  const [[serv]] = await db.query(
    `SELECT * FROM servicios
     WHERE id_servicio_externo = ? AND id_tienda = ?`,
    [id_servicio_externo, id_tienda]
  );

  if (!serv) {
    return {
      disponible: false,
      motivo: "Servicio no encontrado para esa tienda"
    };
  }

  const dur = serv.duracion_minutos;

  // 2. Calcular inicio y fin
  const { inicio, fin } = calcularRangoFechaHora(fecha_cita, hora_cita, dur);

  // 3. Buscar empleado disponible
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

  // 4. Respuesta interna (rica en datos)
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

