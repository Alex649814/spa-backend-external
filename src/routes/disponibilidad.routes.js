
import { Router } from "express";
import { verificarDisponibilidad } from "../controllers/disponibilidad.controller.js";
const router = Router();
router.post("/disponibilidad", verificarDisponibilidad);
export default router;
