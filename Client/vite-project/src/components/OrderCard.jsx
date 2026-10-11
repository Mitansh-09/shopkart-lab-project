import { Link } from "react-router-dom";

function OrderCard({ order }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="order-card">
      <p className="order-card-title">Order #{order._id.slice(-8)}</p>
      <p className="order-card-date">{date}</p>

      <ul className="order-card-items">
        {order.items.map((item) => (
          <li key={item._id}>
            {item.name} × {item.quantity}
          </li>
        ))}
      </ul>

      <p className="order-card-total">
        Total: ₹{order.totalAmount.toLocaleString("en-IN")}
      </p>
      <p className="order-card-status">Status: {order.status}</p>

      <Link to={`/orders/${order._id}`} className="btn-primary product-card-btn">
        View Details
      </Link>
    </div>
  );
}

export default OrderCard;
