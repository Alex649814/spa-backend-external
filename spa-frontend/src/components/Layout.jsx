// src/components/Layout.jsx
import Header from "./Header";
import Footer from "./Footer";

function Layout({ children, pageTitle }) {
  return (
    <div className="app-shell">
      {/* Header recibe el título de la página, por defecto "Servicios" */}
      <Header pageTitle={pageTitle} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;

