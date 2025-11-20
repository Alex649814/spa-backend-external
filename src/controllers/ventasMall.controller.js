// src/controllers/ventasMall.controller.js
import citasService from "../services/citas.service.js";

/**
 * CONTROLADOR PARA REGISTRAR VENTA DESDE EL MALL (REG_VTA_SERV)
 * ------------------------------------------------------------------
 * - Recibe datos del Mall
 * - Llama al servicio para registrar la cita
 * - SOLO responde un OK técnico (no enviamos info de negocio todavía)
 * - Logs claros, bonitos y fáciles de leer en producción
 */
export const registrarVentaMall = async (req, res) => {
  try {
    console.log("📥 [SPA] REG_VTA_SERV - Datos recibidos:");
    console.log(JSON.stringify(req.body, null, 2));

    await citasService.registrarVenta(req.body);

    console.log("✅ [SPA] Cita guardada correctamente en la BD.");

    return res.status(201).json({
      message: "Cita registrada correctamente en SPA"
    });

  } catch (error) {
    console.error("❌ [SPA] Error en REG_VTA_SERV:");
    console.error("   • Mensaje:", error.message);
    console.error("   • Stack trace:", error.stack);

    const erroresCliente = [
      "Faltan datos obligatorios",
      "Servicio no encontrado",
      "No hay empleados disponibles"
    ];

    const esErrorCliente = erroresCliente.some((t) =>
      error.message.includes(t)
    );

    return res.status(esErrorCliente ? 400 : 500).json({
      error: "Error al registrar venta",
      detalle: error.message
    });
  }
};

