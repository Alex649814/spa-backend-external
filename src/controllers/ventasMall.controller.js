// src/controllers/ventasMall.controller.js
import citasService from "../services/citas.service.js";

/**
 * CONTROLADOR PARA REGISTRAR VENTA DESDE EL MALL
 * ---------------------------------------------------
 * - Recibe todos los datos del Mall
 * - Llama a citas.service.js (que hace TODA la lógica real)
 * - Responde en formato que el Mall entiende
 */
export const registrarVentaMall = async (req, res) => {
  try {
    console.log("📥 [MALL] Datos recibidos en registrar-venta:");
    console.log(req.body);

    const resultado = await citasService.registrarVenta(req.body);

    console.log("✅ Venta registrada correctamente:", resultado);

    res.status(201).json({
      mensaje: "Venta registrada correctamente",
      id_cita: resultado.id_cita,
      codigo_reserva: resultado.codigo_reserva,
      fecha_inicio: resultado.fecha_inicio,
      fecha_fin: resultado.fecha_fin,
      duracion_minutos: resultado.duracion_minutos,
      id_empleado: resultado.id_empleado,
      tipo_cabina_reservada: resultado.tipo_cabina_reservada,
    });

  } catch (error) {
    console.error("❌ Error en registrarVentaMall:", error.message);

    res.status(500).json({
      error: "Error al registrar venta",
      detalle: error.message
    });
  }
};




