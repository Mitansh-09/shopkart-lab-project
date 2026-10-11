import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    api
      .get(`/products/${id}`)
      .then((res) => {
        if (isMounted) setProduct(res.data.product);
      })
      .catch(() => {
        if (isMounted) setError("Something went wrong while loading this product.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="product-details-screen">
      <Navbar />
      <main className="product-details-content">
        {loading && <p className="state-message">Loading products...</p>}
        {!loading && error && <p className="state-message error">{error}</p>}
        {!loading && !error && product && (
          <div className="product-details-card">
            <img
              src={product.image}
              alt={product.name}
              className="product-details-image"
            />
            <div className="product-details-info">
              <span className="product-card-category">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="product-details-description">{product.description}</p>
              <p className="product-details-price">
                ₹{product.price.toLocaleString("en-IN")}
              </p>
              <p className={`product-card-stock ${product.stock > 0 ? "" : "out"}`}>
                {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
              </p>
              {/* Backend integration for the cart comes in Lab 4. */}
              <button type="button" className="btn-primary product-details-btn">
                Add to Cart
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;
