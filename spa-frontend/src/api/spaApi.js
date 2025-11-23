// src/api/spaApi.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

console.log("✅ API_BASE_URL =>", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// --------- CATALOGO (Mall) ---------
export async function getCatalogo() {
  const res = await api.get("/catalogo");
  return res.data;
}

// --------- CATEGORÍAS (Web SPA) ---------
export async function getCategorias() {
  const res = await api.get("/categorias");
  return res.data;
}

export async function getServiciosPorCategoria(idCategoria) {
  const res = await api.get(`/categorias/${idCategoria}/servicios`);
  return res.data;
}

// --------- DISPONIBILIDAD ---------
export async function verificarDisponibilidad(body) {
  const res = await api.post("/disponibilidad", body);
  return res.data;
}

// --------- CITAS WEB ---------
export async function crearCitaWeb(body) {
  const res = await api.post("/web", body);
  return res.data;
}

// --------- PAGOS ---------
export async function solicitarPago(body) {
  const res = await api.post("/pagos/solicitar-transaccion", body);
  return res.data;
}
