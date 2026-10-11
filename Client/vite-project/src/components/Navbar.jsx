import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function Navbar() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
    } catch (err) {
      // Even if the request fails (e.g. cookie already expired), the user
      // still wants to leave the account view, so send them to login anyway.
    }
    navigate("/login", { replace: true });
  };

  return (
    <header className="navbar">
      <span className="navbar-brand">ShopKart</span>
      <nav className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/wishlist">Wishlist</Link>
        <Link to="/cart">Cart ({cartCount})</Link>
        <Link to="/orders">Orders</Link>
      </nav>
      <button type="button" className="btn-logout" onClick={handleLogout}>
        Log out
      </button>
    </header>
  );
}

export default Navbar;
