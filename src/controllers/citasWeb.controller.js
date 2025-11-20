import citasService from "../services/citas.service.js";

export const registrarCitaWeb = async (req, res) => {
  try {
    console.log("🌐 [WEB] Solicitud de Nueva Cita Recibida");
    console.log(req.body);

    const resultado = await citasService.crearCitaWeb(req.body);

    console.log("✅ [WEB] Cita creada correctamente:", resultado);

    res.status(201).json({
      mensaje: "Cita registrada correctamente",
      ...resultado
    });

  } catch (error) {
    console.error("❌ Error en registrarCitaWeb:", error);

    res.status(500).json({
      error: "Error al registrar la cita desde sitio web",
      detalle: error.message
    });
  }
};
