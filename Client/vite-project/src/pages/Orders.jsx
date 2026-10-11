import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import OrderCard from "../components/OrderCard";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    setError(false);

    api
      .get("/orders")
      .then((res) => setOrders(res.data.orders))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="products-screen">
      <Navbar />
      <main className="products-content">
        <h1>My Orders</h1>

        {loading && <p className="state-message">Loading your orders...</p>}

        {!loading && error && (
          <div className="state-message error">
            <p>Unable to load your orders.</p>
            <button type="button" className="btn-primary" onClick={fetchOrders}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="state-message">
            <p>You have not placed any orders yet.</p>
            <Link to="/products" className="btn-primary">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="order-list">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
