// src/pages/CategoriesPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategorias } from "../api/spaApi.js";

function CategoriesPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        setLoading(true);
        const data = await getCategorias();
        setCategorias(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las categorías.");
      } finally {
        setLoading(false);
      }
    }

    cargar();
  }, []);

  const handleClickCategoria = (cat) => {
    navigate(`/categoria/${cat.id_categoria}`, {
      state: { categoria: cat }
    });
  };

  return (
    <div>
      <h1 style={{ marginBottom: "0.5rem" }}>Servicios</h1>
      <p style={{ marginBottom: "1.5rem" }}>
        Elige una categoría para ver los tratamientos disponibles.
      </p>

      {loading && <p>Cargando categorías...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {categorias.map((cat) => (
            <button
              key={cat.id_categoria}
              onClick={() => handleClickCategoria(cat)}
              style={{
                textAlign: "left",
                borderRadius: "12px",
                overflow: "hidden",
                padding: 0,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                cursor: "pointer"
              }}
            >
              {cat.imagen_url && (
                <div
                  style={{
                    height: "180px",
                    overflow: "hidden",
                    borderBottom: "1px solid #e5e7eb"
                  }}
                >
                  <img
                    src={cat.imagen_url}
                    alt={cat.nombre}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              )}

              <div style={{ padding: "0.75rem 1rem" }}>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: "600",
                    marginBottom: "0.25rem"
                  }}
                >
                  {cat.nombre}
                </h2>
                {cat.descripcion && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#6b7280"
                    }}
                  >
                    {cat.descripcion}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoriesPage;
