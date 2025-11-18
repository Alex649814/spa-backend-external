// src/services/asignacion.service.js
import db from "../db/connection.js";

/**
 * Convierte una fecha (YYYY-MM-DD) a abreviatura de día de la semana
 * según el formato de dias_trabajo, por ejemplo: 'L-M-Mi-J-V'.
 *
 * 0 = Domingo -> 'D'
 * 1 = Lunes   -> 'L'
 * 2 = Martes  -> 'M'
 * 3 = Miércoles -> 'Mi'
 * 4 = Jueves  -> 'J'
 * 5 = Viernes -> 'V'
 * 6 = Sábado  -> 'S'
 */
function obtenerAbreviaturaDia(fechaCita) {
  const d = new Date(`${fechaCita}T12:00:00`); // mediodía para evitar temas de zona horaria
  const day = d.getDay();
  const mapa = ["D", "L", "M", "Mi", "J", "V", "S"];
  return mapa[day] || "L";
}

/**
 * Calcula fecha/hora de inicio y fin a partir de fecha, hora y duración.
 * Devuelve { inicio, fin, horaFin } como strings "YYYY-MM-DD HH:MM:SS".
 */
function calcularRangoFechaHora(fechaCita, horaCita, duracionMinutos) {
  // horaCita puede venir como "HH:MM" → normalizamos a "HH:MM:00"
  const horaNormalizada = horaCita.length === 5 ? `${horaCita}:00` : horaCita;
  const inicio = `${fechaCita} ${horaNormalizada}`;
  const inicioDate = new Date(inicio);
  const finDate = new Date(inicioDate.getTime() + duracionMinutos * 60000);
  const fin = finDate.toISOString().slice(0, 19).replace("T", " ");
  const horaFin = fin.slice(11, 19); // HH:MM:SS

  return { inicio, fin, horaFin };
}

/**
 * Busca un empleado disponible para el rango de fecha/hora.
 * Valida:
 * - que esté ACTIVO
 * - que su turno cubra el horario (hora_inicio_turno / hora_fin_turno)
 * - que el día esté dentro de dias_trabajo (ej. 'L-M-Mi-J-V')
 * - que NO tenga citas traslapadas (PENDIENTE_PAGO o CONFIRMADA)
 */
export async function buscarEmpleadoDisponible(
  idTienda,
  fechaCita,
  horaCita,
  duracionMinutos
) {
  const { inicio, fin, horaFin } = calcularRangoFechaHora(
    fechaCita,
    horaCita,
    duracionMinutos
  );
  const abreviaturaDia = obtenerAbreviaturaDia(fechaCita);

  const [rows] = await db.query(
    `
    SELECT e.id_empleado
    FROM empleados e
    WHERE e.id_tienda = ?
      AND e.estatus = 'ACTIVO'
      AND (e.hora_inicio_turno IS NULL OR e.hora_inicio_turno <= ?)
      AND (e.hora_fin_turno IS NULL OR e.hora_fin_turno >= ?)
      AND (
        e.dias_trabajo IS NULL
        OR e.dias_trabajo = ''
        OR e.dias_trabajo LIKE CONCAT('%', ?, '%')
      )
      AND NOT EXISTS (
        SELECT 1
        FROM citas c
        WHERE c.id_empleado = e.id_empleado
          AND c.estatus IN ('PENDIENTE_PAGO','CONFIRMADA')
          AND NOT (
            c.fecha_fin <= ?
            OR c.fecha_inicio >= ?
          )
      )
    LIMIT 1
    `,
    [idTienda, horaCita, horaFin, abreviaturaDia, inicio, fin]
  );

  return rows[0]?.id_empleado || null;
}

export { calcularRangoFechaHora };
