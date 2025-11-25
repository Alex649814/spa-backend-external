// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext.jsx";
import "./CartPage.css";

function CartPage() {
  const {
    cartItems,
    cartSubtotal,
    updateCartItemQuantity,
    clearCart,
  } = useBooking();

  const navigate = useNavigate();

  // Estado local para editar cantidades con los botones
  const [localQuantities, setLocalQuantities] = useState({});

  // Sincronizar cantidades locales con las del contexto
  useEffect(() => {
    const initial = {};
    cartItems.forEach((item) => {
      initial[item.key] = item.cantidad;
    });
    setLocalQuantities(initial);
  }, [cartItems]);

  const handleChangeQty = (itemKey, delta) => {
    setLocalQuantities((prev) => {
      const actual = prev[itemKey] ?? 0;
      const nueva = Math.max(0, actual + delta);
      return { ...prev, [itemKey]: nueva };
    });
  };

  const handleActualizarCarrito = () => {
    cartItems.forEach((item) => {
      const nuevaCantidad = localQuantities[item.key] ?? item.cantidad;
      updateCartItemQuantity(item.key, nuevaCantidad);
    });
  };

  const handleAgregarMasServicios = () => {
    // Puedes cambiar esta ruta si tienes una página específica de catálogo
    navigate("/");
  };

  const handleProcederPagar = () => {
    // Aquí rediriges a la página siguiente (reserva / pago)
    navigate("/reserva");
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">Carrito de compras de servicios</h1>
        <p className="cart-empty">Tu carrito está vacío.</p>
        <button className="btn-primary" onClick={handleAgregarMasServicios}>
          Agregar más servicios
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Carrito de compras de servicios</h1>

      <div className="cart-layout">
        {/* Columna izquierda: tabla */}
        <section className="cart-table-section">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const qty = localQuantities[item.key] ?? item.cantidad;
                return (
                  <tr key={item.key}>
                    <td className="cart-service-name">{item.nombre}</td>
                    <td>MX$ {item.precioUnitario.toFixed(2)}</td>
                    <td>
                      <div className="cart-qty-control">
                        <button
                          type="button"
                          onClick={() => handleChangeQty(item.key, -1)}
                        >
                          −
                        </button>
                        <span>{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleChangeQty(item.key, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>MX$ {(item.precioUnitario * qty).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="cart-actions-row">
            <button
              className="btn-secondary"
              type="button"
              onClick={handleActualizarCarrito}
            >
              Actualizar carrito
            </button>
            <button
              className="btn-link"
              type="button"
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </div>
        </section>

        {/* Columna derecha: resumen */}
        <aside className="cart-summary">
          <h2>Total del carrito</h2>

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>MX$ {cartSubtotal.toFixed(2)}</span>
          </div>

          <div className="cart-summary-row cart-coupon-row">
            <span>Cupon de descuento</span>
            <div className="cart-coupon-input">
              <input type="text" placeholder="Código de cupón" />
              <button type="button" className="btn-secondary">
                Aplicar
              </button>
            </div>
          </div>

          <div className="cart-summary-row cart-total-row">
            <span>Total</span>
            <span>MX$ {cartSubtotal.toFixed(2)}</span>
          </div>

          <div className="cart-summary-buttons">
            <button
              className="btn-secondary full-width"
              type="button"
              onClick={handleAgregarMasServicios}
            >
              Agregar más servicios
            </button>
            <button
              className="btn-primary full-width"
              type="button"
              onClick={handleProcederPagar}
            >
              Proceder a pagar
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CartPage;
