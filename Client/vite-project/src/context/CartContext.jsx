import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCart = () => {
    setLoading(true);
    setError(false);

    api
      .get("/cart")
      .then((res) => setCartItems(res.data.cart))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    const res = await api.post(`/cart/${productId}`);
    setCartItems(res.data.cart);
  };

  const updateQuantity = async (productId, quantity) => {
    const res = await api.patch(`/cart/${productId}`, { quantity });
    setCartItems(res.data.cart);
  };

  const removeFromCart = async (productId) => {
    const res = await api.delete(`/cart/${productId}`);
    setCartItems(res.data.cart);
  };

  // Used after a verified payment: the backend has already emptied the
  // cart, so this just brings the shared frontend state in line with it.
  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
