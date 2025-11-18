
import bancoService from "../services/banco.service.js";
export const notificacionBanco = async (req, res) => {
  try {
    await bancoService.procesarNotificacion(req.body);
    res.json({ mensaje: "Notificación procesada correctamente" });
  } catch (e) {
    res.status(500).json({ error: "Error procesando notificación" });
  }
};
