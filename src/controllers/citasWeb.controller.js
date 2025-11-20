// src/controllers/citasWeb.controller.js
import citasService from "../services/citas.service.js";

/**
 * Crear cita desde el sitio web del SPA
 * ----------------------------------------
 * - No usa user_id del Mall
 * - Usa datos del cliente y del servicio
 * - Responde con id_cita y código de reserva
 */
export const crearCitaWeb = async (req, res) => {
  try {
    console.log("📥 [SPA_WEB] Crear cita web - datos recibidos:");
    console.log(JSON.stringify(req.body, null, 2));

    const resultado = await citasService.crearCitaWeb(req.body);

    console.log("✅ [SPA_WEB] Cita creada correctamente:", resultado);

    return res.status(201).json({
      message: "Cita creada correctamente",
      ...resultado
    });
  } catch (error) {
    console.error("❌ [SPA_WEB] Error al crear cita web:");
    console.error("   • Mensaje:", error.message);
    console.error("   • Stack:", error.stack);

    const erroresCliente = [
      "Faltan datos obligatorios",
      "Servicio no encontrado",
      "No hay empleados disponibles"
    ];

    const esErrorCliente = erroresCliente.some((t) =>
      error.message.includes(t)
    );

    return res.status(esErrorCliente ? 400 : 500).json({
      error: "Error al crear la cita",
      detalle: error.message
    });
  }
};
