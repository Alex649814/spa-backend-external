
import { Router } from "express";
import { notificacionBanco } from "../controllers/banco.controller.js";
const router = Router();
router.post("/banco/notificacion", notificacionBanco);
export default router;
