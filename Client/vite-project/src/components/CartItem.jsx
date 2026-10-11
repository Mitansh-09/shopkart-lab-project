import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;
  const lineTotal = product.price * quantity;

  const handleIncrease = () => {
    if (quantity >= product.stock) return; // don't exceed stock
    updateQuantity(product._id, quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity <= 1) return; // use Remove instead of going below 1
    updateQuantity(product._id, quantity - 1);
  };

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} className="cart-item-image" />
      <div className="cart-item-info">
        <h3>{product.name}</h3>
        <p className="cart-item-price">₹{product.price.toLocaleString("en-IN")}</p>
      </div>
      <div className="cart-item-controls">
        <div className="quantity-controls">
          <button type="button" onClick={handleDecrease} disabled={quantity <= 1}>
            −
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= product.stock}
          >
            +
          </button>
        </div>
        <p className="cart-item-line-total">₹{lineTotal.toLocaleString("en-IN")}</p>
        <button
          type="button"
          className="btn-remove-wishlist"
          onClick={() => removeFromCart(product._id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default CartItem;
