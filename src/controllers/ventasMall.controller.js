import citasService from "../services/citas.service.js";

export const registrarVentaMall = async (req, res) => {
  try {
    const resultado = await citasService.registrarVenta(req.body);
    res.status(201).json(resultado);
  } catch (e) {
    console.error("Error en registrarVentaMall:", e);         // 👈 AGREGA ESTO
    res.status(500).json({ error: "Error al registrar venta" });
  }
};





