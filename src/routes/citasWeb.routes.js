import { Router } from "express";
import { crearCitaWeb } from "../controllers/citasWeb.controller.js";

const router = Router();

router.post("/citas/web", crearCitaWeb);

export default router;
