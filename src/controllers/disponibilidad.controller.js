import disponibilidadService from "../services/disponibilidad.service.js";

export const verificarDisponibilidad = async (req, res) => {
  try {
    const data = await disponibilidadService.procesarDisponibilidad(req.body);
    res.json(data);
  } catch (e) {
    console.error("Error en verificarDisponibilidad:", e);   // 👈 AGREGA ESTO
    res.status(500).json({ error: "Error al verificar disponibilidad" });
  }
};