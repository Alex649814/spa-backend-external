// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorias } from "../api/spaApi";

export default function CategoriesPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const data = await getCategorias();
        setCategorias(data || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las categorías.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleClickCategoria = (cat) => {
    navigate(`/categoria/${cat.id_categoria}`);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050816",
        color: "white",
        padding: "2rem 4rem"
      }}
    >
      <header style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">Servicios</h1>
        <p className="page-subtitle">
          Elige una categoría para ver los tratamientos disponibles.
        </p>
      </header>

      {loading && <p>Cargando categorías...</p>}
      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {!loading && !error && (
        <div className="categories-grid">
          {categorias.map((cat) => {
            const imgSrc = cat.imagen_url || "/categorias/default.jpg";

            return (
              <button
                key={cat.id_categoria}
                className="category-card"
                onClick={() => handleClickCategoria(cat)}
              >
                <div className="category-card__image-wrapper">
                  <img src={imgSrc} alt={cat.nombre} />
                  <div className="category-card__overlay" />
                  <span className="category-card__name">
                    {cat.nombre.toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
