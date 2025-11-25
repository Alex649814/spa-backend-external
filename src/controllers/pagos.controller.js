export const solicitarTransaccion = async (req, res) => {
  try {
    const respuesta = await pagosService.enviarAlBanco(req.body);
    res.json(respuesta);
  } catch (e) {
    console.error("[PAGOS] Error al solicitar transacción:", e);

    // Si el error viene de axios (banco), normalmente trae response.data
    const bankData = e.response?.data;

    return res.status(500).json({
      error: "Error al solicitar transacción",
      message: e.message,
      banco: bankData || null,
    });
  }
};
