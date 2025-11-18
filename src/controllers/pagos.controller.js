
import pagosService from "../services/pagos.service.js";
export const solicitarTransaccion = async (req, res) => {
  try {
    const respuesta = await pagosService.enviarAlBanco(req.body);
    res.json(respuesta);
  } catch (e) {
    res.status(500).json({ error: "Error al solicitar transacción" });
  }
};
