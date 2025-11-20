// src/app.js
import express from "express";

const app = express();

// 🚀 ESTO ES OBLIGATORIO
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
import disponibilidadRoutes from "./routes/disponibilidad.routes.js";
import catalogoRoutes from "./routes/catalogo.routes.js";
import ventasMallRoutes from "./routes/ventasMall.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import bancoRoutes from "./routes/banco.routes.js";
import citasWebRoutes from "./routes/citasWeb.routes.js";

app.use("/api/disponibilidad", disponibilidadRoutes);
app.use("/api/catalogo", catalogoRoutes);
app.use("/api/ventas", ventasMallRoutes);
app.use("/api/pagos", pagosRoutes);
app.use("/api/banco", bancoRoutes);
app.use("/api/citas", citasWebRoutes);

export default app;
