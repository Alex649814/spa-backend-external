
import express from "express";
import cors from "cors";

import catalogoRoutes from "./routes/catalogo.routes.js";
import disponibilidadRoutes from "./routes/disponibilidad.routes.js";
import ventasMallRoutes from "./routes/ventasMall.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import bancoRoutes from "./routes/banco.routes.js";
import citasWebRoutes from "./routes/citasWeb.routes.js";
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", catalogoRoutes);
app.use("/api", disponibilidadRoutes);
app.use("/api", ventasMallRoutes);
app.use("/api", pagosRoutes);
app.use("/api", bancoRoutes);
app.use("/api/citas", citasWebRoutes);

export default app;
