import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import CartItem from "../components/CartItem";
import { useCart } from "../context/CartContext";

function Cart() {
  const { cartItems, loading, error, fetchCart } = useCart();

  // Derived values — never stored anywhere, always calculated fresh
  // from whatever is currently in cartItems.
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="products-screen">
      <Navbar />
      <main className="products-content">
        <h1>My Cart</h1>

        {loading && <p className="state-message">Loading your cart...</p>}

        {!loading && error && (
          <div className="state-message error">
            <p>Unable to load your cart.</p>
            <button type="button" className="btn-primary" onClick={fetchCart}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="state-message">
            <p className="empty-icon">🛒</p>
            <p>Your cart is empty</p>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">
            <div className="cart-items">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <div className="order-summary">
              <h2>Order Summary</h2>
              <p>Items: {itemCount}</p>
              <p className="order-summary-total">
                Subtotal: ₹{subtotal.toLocaleString("en-IN")}
              </p>
              <Link to="/checkout" className="btn-primary product-card-btn">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
