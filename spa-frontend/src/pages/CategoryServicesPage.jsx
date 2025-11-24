// src/pages/CategoryServicesPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getServiciosPorCategoria,
  getCategorias
} from "../api/spaApi.js";
import { useBooking } from "../context/BookingContext.jsx";

function CategoryServicesPage() {
  const { idCategoria } = useParams();      // 👈 importante que coincida con la ruta
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedService } = useBooking();

  // Si venimos desde CategoriesPage, ya traemos la categoría en state
  const [categoria, setCategoria] = useState(location.state?.categoria || null);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cargar servicios
  useEffect(() => {
    async function cargar() {
      try {
        setLoading(true);
        const data = await getServiciosPorCategoria(idCategoria);
        setServicios(data);
      } catch (err) {
        console.error("Error cargando servicios:", err);
        setError("Error al cargar los servicios.");
      } finally {
        setLoading(false);
      }
    }

    if (idCategoria) {
      cargar();
    }
  }, [idCategoria]);

  // Si no traemos la categoría por state, la buscamos en /categorias
  useEffect(() => {
    async function cargarCategoria() {
      if (!categoria && idCategoria) {
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

  const handleMasTratamientos = () => {
    navigate("/"); // te regresa a la página de categorías
  };

  const handleAgregarAlCarrito = (servicio) => {
    // Aquí podrías agregar al carrito real;
    // por ahora lo dejamos como "seleccionar servicio" + ir a reserva
    setSelectedService(servicio);
    navigate("/reserva");
  };

  const titulo = categoria?.nombre || "Servicios";
  const descripcionCategoria = categoria?.descripcion || "";

  return (
    <main className="spa-page spa-page--category">
      {/* Encabezado de la categoría */}
      <section className="category-detail-header">
        <div className="category-detail-header__title-row">
          <h1 className="category-detail-title">{titulo.toUpperCase()}</h1>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleMasTratamientos}
          >
            Más tratamientos
          </button>
        </div>

        {descripcionCategoria && (
          <div className="category-detail-description">
            {descripcionCategoria}
          </div>
        )}
      </section>

      {loading && <p>Cargando servicios...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && servicios.length === 0 && (
        <p>No hay servicios disponibles en esta categoría.</p>
      )}

      {!loading && !error && servicios.length > 0 && (
        <section className="category-services-list">
          {servicios.map((servicio) => (
            <article key={servicio.id} className="service-row">
              <div className="service-row__main">
                <div className="service-row__label">Servicio</div>
                <div className="service-row__name">
                  {servicio.nombre}
                  {servicio.duracion_minutos && (
                    <span className="service-row__duration">
                      {" "}
                      — {servicio.duracion_minutos} Min.
                    </span>
                  )}
                </div>
                {servicio.description && (
                  <div className="service-row__description">
                    {servicio.description}
                  </div>
                )}
              </div>

              <div className="service-row__meta">
                <div>
                  <div className="service-row__label">Duración</div>
                  <div>{servicio.duracion_minutos || "--"} Min.</div>
                </div>
                <div>
                  <div className="service-row__label">Precio</div>
                  <div>MX$ {Number(servicio.precio).toFixed(2)}</div>
                </div>
                <div>
                  <div className="service-row__label">Cantidad</div>
                  {/* Aquí luego metemos los botones +/-.
                      Por ahora solo un placeholder "1". */}
                  <div>1</div>
                </div>
              </div>

              <div className="service-row__actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleAgregarAlCarrito(servicio)}
                >
                  Agregar al carrito
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default CategoryServicesPage;
