// src/routes/categorias.routes.js
import { Router } from "express";
import {
  obtenerCategorias,
  obtenerServiciosDeCategoria
} from "../controllers/categorias.controller.js";

const router = Router();

router.get("/categorias", obtenerCategorias);
router.get("/categorias/:idCategoria/servicios", obtenerServiciosDeCategoria);

export default router;
