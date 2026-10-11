import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

// Razorpay Checkout needs its own script. Returns true/false instead of
// assuming window.Razorpay always exists.
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, loading, clearCart } = useCart();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [placing, setPlacing] = useState(false);

  // Display only. The backend calculates the real total on its own.
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Enter your full name";
    if (!/^\d{10}$/.test(form.phone.trim()))
      next.phone = "Phone must contain 10 digits.";
    if (!form.addressLine1.trim()) next.addressLine1 = "Enter your address";
    if (!form.city.trim()) next.city = "Enter your city";
    if (!form.state.trim()) next.state = "Enter your state";
    if (!/^\d{6}$/.test(form.pincode.trim()))
      next.pincode = "Pincode must contain 6 digits.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError("");

    // No backend call if basic validation fails.
    if (!validate()) return;

    setPlacing(true);

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setServerError("Unable to load the payment gateway. Please try again.");
      setPlacing(false);
      return;
    }

    // Step 1: backend checks cart + stock, calculates the total, saves a
    // pending order and creates the Razorpay order.
    let data;
    try {
      const res = await api.post("/orders/create-payment-order", {
        shippingAddress: form,
      });
      data = res.data;
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
      setPlacing(false);
      return;
    }

    // Step 2: open Razorpay Checkout.
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "ShopKart",
      description: "ShopKart Order",
      order_id: data.razorpayOrderId,

      // Razorpay calls this after a payment. We do NOT trust it yet —
      // the details are sent to our backend, which verifies the signature.
      handler: async (response) => {
        try {
          await api.post("/orders/verify-payment", {
            shopKartOrderId: data.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          // Backend has cleared the cart; bring the shared state in line.
          clearCart();
          navigate(`/orders/${data.shopKartOrderId}`, {
            state: { placed: true },
          });
        } catch (err) {
          setServerError(
            err.response?.data?.message ||
              "Payment could not be verified. Your cart has not been cleared.",
          );
          setPlacing(false);
        }
      },

      prefill: { name: form.fullName, contact: form.phone },

      // User closed the popup without paying.
      modal: { ondismiss: () => setPlacing(false) },
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on("payment.failed", () => {
      setServerError(
        "Payment failed. Your cart has not been cleared. Please try again.",
      );
      setPlacing(false);
    });

    paymentObject.open();
  };

  return (
    <div className="products-screen">
      <Navbar />
      <main className="products-content">
        <h1>Checkout</h1>

        {loading && <p className="state-message">Loading your cart...</p>}

        {!loading && cartItems.length === 0 && (
          <div className="state-message">
            <p className="empty-icon">🛒</p>
            <p>Your cart is empty</p>
            <p>Add some products before checking out.</p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && cartItems.length > 0 && (
          <>
            {serverError && (
              <div className="form-banner error">{serverError}</div>
            )}

            <form onSubmit={handlePlaceOrder} noValidate>
              <div className="cart-layout">
                <div className="checkout-form">
                  <h2>Shipping Details</h2>

                  <div className="field">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                    />
                    {errors.fullName && (
                      <span className="field-error">{errors.fullName}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                    />
                    {errors.phone && (
                      <span className="field-error">{errors.phone}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="addressLine1">Address</label>
                    <input
                      id="addressLine1"
                      name="addressLine1"
                      value={form.addressLine1}
                      onChange={handleChange}
                    />
                    {errors.addressLine1 && (
                      <span className="field-error">{errors.addressLine1}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                    />
                    {errors.city && (
                      <span className="field-error">{errors.city}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="state">State</label>
                    <input
                      id="state"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                    />
                    {errors.state && (
                      <span className="field-error">{errors.state}</span>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="pincode">Pincode</label>
                    <input
                      id="pincode"
                      name="pincode"
                      value={form.pincode}
                      onChange={handleChange}
                    />
                    {errors.pincode && (
                      <span className="field-error">{errors.pincode}</span>
                    )}
                  </div>
                </div>

                <div className="order-summary">
                  <h2>Order Summary</h2>
                  {cartItems.map((item) => (
                    <div className="summary-line" key={item.product._id}>
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        ₹
                        {(item.product.price * item.quantity).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="summary-line summary-total">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={placing}
                  >
                    {placing ? "Placing order…" : "Place Order"}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export default Checkout;
