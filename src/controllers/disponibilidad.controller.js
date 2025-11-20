// src/controllers/disponibilidad.controller.js
import disponibilidadService from "../services/disponibilidad.service.js";

export const verificarDisponibilidad = async (req, res) => {
  try {
    console.log("📥 [MALL] SOL_DISP_FECHA recibido:");
    console.log(req.body);

    const body = req.body;

    // 🔧 NORMALIZACIÓN: Mall -> nombres internos del SPA
    const payload = {
      id_tienda: body.id_tienda ?? body.store_id,
      id_servicio_externo: body.id_servicio_externo ?? body.service_external_id,
      fecha_cita: body.fecha_cita ?? body.appointment_date,
      hora_cita: body.hora_cita ?? body.appointment_time,
      tipo_cabina: body.tipo_cabina ?? null
    };

    console.log("🔧 Payload normalizado para servicio:");
    console.log(payload);

    const data = await disponibilidadService.procesarDisponibilidad(payload);

    console.log("📤 Respuesta interna de procesarDisponibilidad:", data);

    // ❌ No hay disponibilidad
    if (!data.disponible) {
      return res.json({
        servicio_id: null,
        fecha_inicio: null,
        fecha_fin: null,
        duracion_minutos: null,
        id_cita: null,
        id_barbero: null,
        motivo: data.motivo
      });
    }

    // ✅ Sí hay disponibilidad
    const respuestaMall = {
      servicio_id: data.id_servicio,
      fecha_inicio: data.fecha_inicio,
      fecha_fin: data.fecha_fin,
      duracion_minutos: data.duracion_minutos,
      id_cita: null, // aún no se crea
      id_barbero: data.id_empleado_sugerido
    };

    console.log("📤 [MALL] DISP_FECHA enviado:");
    console.log(respuestaMall);

    return res.json(respuestaMall);
  } catch (e) {
    console.error("❌ Error en verificarDisponibilidad:", e);
    return res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
};
