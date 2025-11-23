// src/services/categorias.service.js
import db from "../db/connection.js";

// Lista todas las categorías activas de una tienda
async function listarCategorias(idTienda = 2) {
  const [rows] = await db.query(
    `SELECT 
        id_categoria,
        nombre,
        descripcion,
        imagen_url
     FROM categorias_servicio
     WHERE id_tienda = ?
       AND estatus = 'ACTIVA'
     ORDER BY id_categoria`,
    [idTienda]
  );

  return rows; // tal cual para el frontend
}

// Lista los servicios de una categoría
async function listarServiciosPorCategoria(idCategoria, idTienda = 2) {
  const [rows] = await db.query(
    `SELECT
        s.id_servicio AS id,
        s.id_servicio_externo,
        s.nombre,
        s.descripcion,
        s.precio_base,
        s.duracion_minutos
     FROM servicios s
     WHERE s.id_tienda = ?
       AND s.id_categoria = ?
       AND s.estatus = 'ACTIVO'
     ORDER BY s.id_servicio`,
    [idTienda, idCategoria]
  );

  // Los adaptamos al formato que ya usas en el frontend
  return rows.map((s) => ({
    id: s.id,
    store_id: idTienda,
    service_external_id: s.id_servicio_externo,
    nombre: s.nombre,
    description: s.descripcion,
    precio: Number(s.precio_base),
    duracion_minutos: s.duracion_minutos,
    // Campos que el Mall usa pero aquí no aplican
    talla: null,
    color: null,
    stock: null
  }));
}

export default {
  listarCategorias,
  listarServiciosPorCategoria
};
