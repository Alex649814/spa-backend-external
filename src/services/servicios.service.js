
import db from "../db/connection.js";
const listarCatalogo = async () => {
  const [rows] = await db.query("SELECT * FROM servicios");
  return { tienda: 1, servicios: rows };
};
export default { listarCatalogo };
