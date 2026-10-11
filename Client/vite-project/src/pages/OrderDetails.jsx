import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

// One page for both: the confirmation right after paying (checkout sends
// state.placed = true) and "View Details" from My Orders.
function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    api
      .get(`/orders/${id}`)
      .then((res) => setOrder(res.data.order))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="products-screen">
      <Navbar />
      <main className="products-content">
        {location.state?.placed && (
          <div className="order-success">
            <p className="empty-icon">✅</p>
            <h2>Order Placed Successfully</h2>
            <p>Your order has been saved successfully.</p>
          </div>
        )}

        <h1>Order Details</h1>

        {loading && <p className="state-message">Loading your order...</p>}

        {!loading && error && (
          <div className="state-message error">
            <p>Unable to load this order.</p>
            <Link to="/orders" className="btn-primary">
              My Orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="order-details-card">
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Payment:</strong> {order.paymentStatus}
            </p>

            <h3>Items</h3>
            {order.items.map((item) => (
              <div className="summary-line" key={item._id}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
            <div className="summary-line summary-total">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString("en-IN")}</span>
            </div>

            <h3>Shipping To</h3>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.phone}</p>
            <p>
              {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
              {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        )}

        <div className="order-actions">
          <Link to="/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}

export default OrderDetails;
