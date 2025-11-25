// src/pages/CategoryServicesPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getServiciosPorCategoria, getCategorias } from "../api/spaApi.js";
import { useBooking } from "../context/BookingContext.jsx";
import "./CategoryServicesPage.css";

function CategoryServicesPage() {
  const { idCategoria } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Del contexto: función para agregar al carrito
  const { addToCart } = useBooking();

  const [categoria, setCategoria] = useState(location.state?.categoria || null);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  // cantidades por id de servicio  { [idServicio]: number }
  const [cantidades, setCantidades] = useState({});

  // Cargar servicios por categoría
  useEffect(() => {
    async function cargar() {
      try {
        const data = await getServiciosPorCategoria(idCategoria);
        setServicios(data || []);
      } catch (error) {
        console.error("Error cargando servicios:", error);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [idCategoria]);

  // Cargar categoría (para nombre, descripción, imagen)
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

  // Cambiar cantidad de un servicio
  const handleChangeCantidad = (idServicio, delta) => {
    setCantidades((prev) => {
      const actual = prev[idServicio] || 0;
      const nueva = Math.max(0, actual + delta); // nunca menos de 0
      return { ...prev, [idServicio]: nueva };
    });
  };

  // Botón "Agregar al carrito" (único al final)
  const handleAgregarCarrito = () => {
    let algoSeleccionado = false;

    servicios.forEach((serv) => {
      const qty = cantidades[serv.id] || 0;
      if (qty > 0) {
        algoSeleccionado = true;
        addToCart(serv, qty); // el contexto ya calcula totales
      }
    });

    if (!algoSeleccionado) {
      alert("Selecciona al menos 1 tratamiento antes de continuar.");
      return;
    }

    // Opcional: limpiar cantidades después de agregar
    // setCantidades({});

    // Ir a la pantalla de carrito
    navigate("/carrito");
  };

  if (loading) {
    return (
      <div className="category-page">
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="category-page">
      {/* TÍTULO SUPERIOR (MASAJES, FACIALES, etc.) */}
      <h1 className="category-title">
        {categoria?.nombre?.toUpperCase() || "CATEGORÍA"}
      </h1>

      {/* HERO: IMAGEN + DESCRIPCIÓN EN CUADRO GRIS (2 columnas) */}
      <section className="category-hero">
        {categoria?.imagen_url && (
          <img
            src={categoria.imagen_url}
            alt={categoria.nombre}
            className="category-main-image"
          />
        )}

        {categoria?.descripcion && (
          <div className="category-description-box">
            {categoria.descripcion}
          </div>
        )}
      </section>

      {/* BARRA CON TEXTO + BOTÓN "Más tratamientos" */}
      <div className="category-header-bar">
        <h2>SELECCIONA EL TRATAMIENTO</h2>
        <button className="btn-volver" onClick={() => navigate("/")}>
          Más tratamientos
        </button>
      </div>

      {/* Si no hay servicios */}
      {servicios.length === 0 && (
        <p>No hay servicios disponibles en esta categoría.</p>
      )}

      {/* TABLA DE SERVICIOS */}
      {servicios.length > 0 && (
        <>
          <section className="services-table">
            {/* Encabezados */}
            <div className="services-header-row">
              <div className="col-servicio-header">Servicio</div>
              <div className="col-duracion-header">Duración</div>
              <div className="col-precio-header">Precio</div>
              <div className="col-cantidad-header">Cantidad</div>
            </div>

            {/* Filas */}
            {servicios.map((serv) => {
              const qty = cantidades[serv.id] || 0;
              const precio = Number(serv.precio || 0);

              return (
                <div key={serv.id} className="service-row">
                  {/* Servicio: nombre + descripción */}
                  <div className="col-servicio">
                    <div className="service-name">{serv.nombre}</div>
                    {serv.description && (
                      <div className="service-short-desc">
                        {serv.description}
                      </div>
                    )}
                  </div>

                  {/* Duración */}
                  <div className="col-duracion">
                    {serv.duracion_minutos || "--"} Min.
                  </div>

                  {/* Precio */}
                  <div className="col-precio">MX$ {precio.toFixed(2)}</div>

                  {/* Cantidad: - 0 + */}
                  <div className="col-cantidad">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleChangeCantidad(serv.id, -1)}
                    >
                      −
                    </button>
                    <span className="qty-value">{qty}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleChangeCantidad(serv.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Botón grande al final */}
          <button
            className="btn-primary btn-add-bottom"
            type="button"
            onClick={handleAgregarCarrito}
          >
            Agregar al carrito
          </button>
        </>
      )}
    </div>
  );
}

export default CategoryServicesPage;
