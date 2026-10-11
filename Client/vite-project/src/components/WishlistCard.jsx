import { Link } from "react-router-dom";

function WishlistCard({ product, onRemove }) {
  const inStock = product.stock > 0;

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-card-image" />
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3 className="product-card-name">{product.name}</h3>
        <p className="product-card-price">₹{product.price.toLocaleString("en-IN")}</p>
        <p className={`product-card-stock ${inStock ? "" : "out"}`}>
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>
        <Link to={`/products/${product._id}`} className="btn-primary product-card-btn">
          View Details
        </Link>
        <button
          type="button"
          className="btn-remove-wishlist"
          onClick={() => onRemove(product._id)}
        >
          Remove 🗑️
        </button>
      </div>
    </div>
  );
}

export default WishlistCard;
