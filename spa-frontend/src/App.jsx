// src/App.jsx
import { Routes, Route } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryServicesPage from "./pages/CategoryServicesPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <BookingProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<CategoriesPage />} />
          <Route
            path="/categoria/:idCategoria"
            element={<CategoryServicesPage />}
          />
          <Route path="/reserva" element={<BookingPage />} />
          <Route path="/pago" element={<PaymentPage />} />
        </Routes>
      </Layout>
    </BookingProvider>
  );
}

export default App;
