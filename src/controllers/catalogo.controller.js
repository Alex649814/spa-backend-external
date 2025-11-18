
import serviciosService from "../services/servicios.service.js";
export const obtenerCatalogo = async (req, res) => {
  try {
    const catalogo = await serviciosService.listarCatalogo();
    res.json(catalogo);
  } catch (e) {
    res.status(500).json({ error: "Error al obtener catálogo" });
  }
};
