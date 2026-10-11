import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    // Small delay so a new request isn't fired on every keystroke while
    // the user is still typing in the search box.
    const timer = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;

      api
        .get("/products", { params })
        .then((res) => {
          if (isMounted) setProducts(res.data.products);
        })
        .catch(() => {
          if (isMounted) setError("Something went wrong while loading products.");
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, category]);

  return (
    <div className="products-screen">
      <Navbar />
      <main className="products-content">
        <h1>Products</h1>
        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading && <p className="state-message">Loading products...</p>}
        {!loading && error && <p className="state-message error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="state-message">No products found.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;
