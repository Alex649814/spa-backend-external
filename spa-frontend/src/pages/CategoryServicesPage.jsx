// src/pages/CategoryServicesPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getServiciosPorCategoria, getCategorias } from "../api/spaApi.js";
import { useBooking } from "../context/BookingContext.jsx";

function CategoryServicesPage() {
  const { idCategoria } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedService } = useBooking();

  const [categoria, setCategoria] = useState(
    location.state?.categoria || null
  );
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar servicios de la categoría
  useEffect(() => {
    async function cargar() {
      try {
        setLoading(true);
        const data = await getServiciosPorCategoria(idCategoria);
        setServicios(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los servicios.");
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, [idCategoria]);

  // Si no recibimos info de la categoría por state, la traemos de /categorias
  useEffect(() => {
    async function cargarCategoria() {
      if (!categoria) {
        try {
          const cats = await getCategorias();
          const found = cats.find(
            (c) => String(c.id_categoria) === String(idCategoria)
          );
          if (found) setCategoria(found);
        } catch (err) {
          console.error("Error cargando categoría:", err);
        }
      }
    }
    cargarCategoria();
  }, [categoria, idCategoria]);

  const handleReservar = (servicio) => {
    setSelectedService(servicio);
    navigate("/reserva");
  };

  const titulo = categoria?.nombre || "Servicios";
  const descripcion = categoria?.descripcion || "";

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>{titulo}</h1>
      {descripcion && (
        <p style={{ marginBottom: "1.5rem" }}>{descripcion}</p>
      )}

      {loading && <p>Cargando servicios...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && servicios.length === 0 && (
        <p>No hay servicios disponibles en esta categoría.</p>
      )}

      {!loading && !error && servicios.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {servicios.map((servicio) => (
            <div
              key={servicio.id}
              style={{
                borderRadius: "16px",
                padding: "1.25rem 1.5rem",
                background: "#020617",
                border: "1px solid #1f2937",
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap"
              }}
            >
              <div style={{ flex: 1, minWidth: "220px" }}>
                <h2
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: "600",
                    marginBottom: "0.25rem"
                  }}
                >
                  {servicio.nombre}{" "}
                  {servicio.duracion_minutos && (
                    <span style={{ fontWeight: "normal", fontSize: "0.95rem" }}>
                      {servicio.duracion_minutos} min
                    </span>
                  )}
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#d1d5db",
                    marginBottom: "0.5rem"
                  }}
                >
                  {servicio.description}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  minWidth: "180px"
                }}
              >
                <p
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem"
                  }}
                >
                  MX$ {Number(servicio.precio).toFixed(2)}
                </p>
                <button
                  onClick={() => handleReservar(servicio)}
                  style={{
                    padding: "0.5rem 1.2rem",
                    borderRadius: "999px",
                    border: "none",
                    backgroundColor: "#a47b5b",
                    color: "white",
                    fontWeight: "bold",
                    cursor: "pointer"
                  }}
                >
                  Reservar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryServicesPage;
