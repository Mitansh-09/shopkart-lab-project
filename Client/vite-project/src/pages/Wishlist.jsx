import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import WishlistCard from "../components/WishlistCard";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchWishlist = () => {
    setLoading(true);
    setError(false);

    api
      .get("/wishlist")
      .then((res) => setWishlist(res.data.wishlist))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  // Runs once when the page opens. The Try Again button below calls
  // fetchWishlist directly rather than through this effect.
  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
    } catch (error) {
    }
  };

  return (
    <div className="products-screen">
      <Navbar />
      <main className="products-content">
        <h1>My Wishlist</h1>

        {loading && <p className="state-message">Loading your wishlist...</p>}

        {!loading && error && (
          <div className="state-message error">
            <p>Something went wrong.</p>
            <p>We couldn't load your wishlist.</p>
            <button type="button" className="btn-primary" onClick={fetchWishlist}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="state-message">
            <p className="empty-heart">❤️</p>
            <p>Your wishlist is empty</p>
            <p>Save products you love and find them here later.</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <>
            <p className="wishlist-count">{wishlist.length} products saved</p>
            <div className="product-grid">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Wishlist;
