// src/components/Layout.jsx
function Layout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#020617",
        color: "white",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      {/* Barra superior simple */}
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #1f2937",
          backgroundColor: "#0b1120"
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#a5b4fc"
          }}
        >
          Dreams Kingdom Spa
        </h1>
      </header>

      {/* Contenido de las páginas */}
      <main
        style={{
          flex: 1,
          padding: "2rem",
          maxWidth: "1100px",
          margin: "0 auto",
          width: "100%"
        }}
      >
        {children}
      </main>

      {/* Footer básico */}
      <footer
        style={{
          padding: "1rem 2rem",
          borderTop: "1px solid #1f2937",
          backgroundColor: "#020617",
          fontSize: "0.8rem",
          color: "#9ca3af",
          textAlign: "center"
        }}
      >
        © {new Date().getFullYear()} Dreams Kingdom Spa · Horario: Lun - Sáb 9 AM - 6 PM
      </footer>
    </div>
  );
}

export default Layout;
