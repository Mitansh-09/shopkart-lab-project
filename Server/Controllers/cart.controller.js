import mongoose from "mongoose";
import Customer from "../Models/customer.model.js";
import Product from "../Models/product.model.js";

// Shared by all four functions below, so the same populate logic
// (and the same trimmed product fields) isn't repeated four times.
const getPopulatedCart = async (userId) => {
  const customer = await Customer.findById(userId).populate({
    path: "cart.product",
    select: "name price image stock",
  });
  return customer.cart;
};

// POST /cart/:productId
// If the product is already in the cart, this increases its quantity
// by 1 instead of creating a second row for the same product.
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );
    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

    if (newQuantity > product.stock) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available stock" });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      req.user.cart.push({ product: productId, quantity: 1 });
    }

    await req.user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// GET /cart
const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// PATCH /cart/:productId   body: { quantity }
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const item = req.user.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    if (quantity > product.stock) {
      return res
        .status(400)
        .json({ message: "Requested quantity exceeds available stock" });
    }

    item.quantity = quantity;
    await req.user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// DELETE /cart/:productId
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const isInCart = req.user.cart.some(
      (item) => item.product.toString() === productId
    );
    if (!isInCart) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    req.user.cart = req.user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    await req.user.save();

    const cart = await getPopulatedCart(req.user._id);
    res.status(200).json({ success: true, message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export { addToCart, getCart, updateQuantity, removeFromCart };
