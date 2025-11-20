// src/controllers/disponibilidad.controller.js
import disponibilidadService from "../services/disponibilidad.service.js";

export const verificarDisponibilidad = async (req, res) => {
  try {
    console.log("📥 [MALL] SOL_DISP_FECHA recibido:");
    console.log(req.body);

    const body = req.body;

    // Soportamos tanto los nombres del mall como los nuestros
    const payload = {
      id_tienda: body.id_tienda ?? body.store_id,
      id_servicio_externo:
        body.id_servicio_externo ?? body.service_external_id,
      fecha_cita: body.fecha_cita ?? body.appointment_date,
      hora_cita: body.hora_cita ?? body.appointment_time,
      // tipo_cabina es opcional (por si tú lo sigues usando desde tu front)
      tipo_cabina: body.tipo_cabina ?? null
    };

    const data = await disponibilidadService.procesarDisponibilidad(payload);

    // Si NO hay disponibilidad, devolvemos todo en null + motivo (extra)
    if (!data.disponible) {
      return res.json({
        servicio_id: null,
        fecha_inicio: null,
        fecha_fin: null,
        duracion_minutos: null,
        id_cita: null,
        id_barbero: null,
      });
    }

    // Si SÍ hay disponibilidad → formateamos como DISP_FECHA
    const respuestaMall = {
      servicio_id: data.id_servicio,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      duracion_minutos: data.duracion_minutos,
      id_cita: null, // todavía no se crea, eso pasa en la venta
      id_barbero: data.id_empleado_sugerido
    };

    console.log("📤 [MALL] DISP_FECHA enviado:");
    console.log(respuestaMall);

    res.json(respuestaMall);
  } catch (e) {
    console.error("Error en verificarDisponibilidad:", e);
    res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
};
