import { BrowserRouter, Routes, Route } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import CategoryServicesPage from "./pages/CategoryServicesPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import PaymentPage from "./pages/PaymentPage.jsx";
import { BookingProvider } from "./context/BookingContext.jsx";
import Layout from "./components/Layout.jsx"; // o el layout que estés usando

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
