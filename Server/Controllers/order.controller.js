import crypto from "crypto";
import mongoose from "mongoose";
import Order from "../Models/order.model.js";
import Product from "../Models/product.model.js";
import getRazorpay from "../Config/razorpay.js";

// Returns an error message if the address is bad, or "" if it is fine.
const validateShippingAddress = (address) => {
  if (!address) return "Shipping address is required";

  const { fullName, phone, addressLine1, city, state, pincode } = address;
  const fields = [fullName, phone, addressLine1, city, state, pincode];

  // Every field must be a non-empty string (whitespace-only is invalid).
  if (fields.some((value) => typeof value !== "string" || !value.trim())) {
    return "All shipping fields are required";
  }
  if (!/^\d{10}$/.test(phone.trim())) {
    return "Phone must contain 10 digits";
  }
  if (!/^\d{6}$/.test(pincode.trim())) {
    return "Pincode must contain 6 digits";
  }
  return "";
};

// POST /orders/create-payment-order
// Body: { shippingAddress }. Anything else (like a total) is ignored.
const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ message: addressError });
    }

    // The cart comes from the logged-in user, never from the request.
    if (req.user.cart.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // Load the LATEST product data for every cart item, check stock,
    // and build the snapshot + total on the server.
    const items = [];
    let totalAmount = 0;

    for (const cartItem of req.user.cart) {
      const product = await Product.findById(cartItem.product);

      if (!product) {
        return res
          .status(400)
          .json({ message: "A product in your cart is no longer available" });
      }

      if (cartItem.quantity > product.stock) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}.` });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
      totalAmount += product.price * cartItem.quantity;
    }

    // Pending order: the cart is NOT touched here.
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      totalAmount,
    });

    // Razorpay wants the amount in paise (1 rupee = 100 paise).
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: order._id.toString(),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Only the public Key ID is sent. The Key Secret never leaves the server.
    res.status(200).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// POST /orders/verify-payment
const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment details are missing" });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "PAID") {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Use the Razorpay order id saved in OUR database, not the one the
    // browser sent, to build the text that gets signed.
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Order stays pending and the cart is left alone.
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Cart is cleared ONLY now, after the payment is verified.
    req.user.cart = [];
    await req.user.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /orders  (newest first). Unpaid pending orders are left out so
// abandoned checkouts don't clutter the user's history.
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      paymentStatus: "PAID",
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /orders/:id
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findById(id);

    // Same 404 for "doesn't exist" and "belongs to someone else", so a
    // user can't even tell whether another person's order ID is real.
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export { createPaymentOrder, verifyPayment, getOrders, getOrderById };
