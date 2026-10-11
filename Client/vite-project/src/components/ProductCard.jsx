import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useCart } from "../context/CartContext";

function ProductCard({ product }) {
  const inStock = product.stock > 0;
  const { addToCart } = useCart();

  // idle -> saving -> added, or idle -> saving -> error
  const [wishlistStatus, setWishlistStatus] = useState("idle");
  // idle -> adding -> idle (success), or idle -> adding -> error
  const [cartStatus, setCartStatus] = useState("idle");

  const handleAddToWishlist = async () => {
    if (wishlistStatus === "saving" || wishlistStatus === "added") return;

    setWishlistStatus("saving");

    try {
      await api.post(`/wishlist/${product._id}`);
      setWishlistStatus("added");
    } catch (error) {
      if (error.response?.status === 409) {
        setWishlistStatus("added");
      } else {
        setWishlistStatus("error");
      }
    }
  };

  const handleAddToCart = async () => {
    if (cartStatus === "adding") return;

    setCartStatus("adding");

    try {
      await addToCart(product._id);
      setCartStatus("idle");
    } catch (error) {
      setCartStatus("error");
    }
  };

  const wishlistLabel =
    wishlistStatus === "saving"
      ? "⏳ Saving..."
      : wishlistStatus === "added"
        ? "♥ Added to Wishlist"
        : "♡ Add to Wishlist";

  return (
    <div className="product-card">
      <img
        src={product.image}
        alt={product.name}
        className="product-card-image"
      />
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p className={`product-card-stock ${inStock ? "" : "out"}`}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>
        <Link
          to={`/products/${product._id}`}
          className="btn-primary product-card-btn"
        >
          View Details
        </Link>
        <button
          type="button"
          className="btn-primary"
          onClick={handleAddToCart}
          disabled={!inStock || cartStatus === "adding"}
        >
          {cartStatus === "adding" ? "Adding..." : "Add to Cart"}
        </button>
        {cartStatus === "error" && (
          <p className="wishlist-error">
            Unable to add to cart. Please try again.
          </p>
        )}
        <button
          type="button"
          className="btn-wishlist"
          onClick={handleAddToWishlist}
          disabled={wishlistStatus === "saving" || wishlistStatus === "added"}
        >
          {wishlistLabel}
        </button>
        {wishlistStatus === "error" && (
          <p className="wishlist-error">
            Unable to save product. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
