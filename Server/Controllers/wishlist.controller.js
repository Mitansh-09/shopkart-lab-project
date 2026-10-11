import mongoose from "mongoose";
import Customer from "../Models/customer.model.js";
import Product from "../Models/product.model.js";

// POST /wishlist/:productId
// req.user is set by the isAuthenticated middleware, so the user is
// always taken from the verified token, never from the request body.
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadySaved = req.user.wishlist.some(
      (id) => id.toString() === productId,
    );
    if (alreadySaved) {
      return res.status(409).json({ message: "Product already in wishlist" });
    }

    req.user.wishlist.push(productId);
    await req.user.save();

    res
      .status(200)
      .json({ success: true, message: "Product added to wishlist" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// GET /wishlist
// Always reads the CURRENT user's wishlist (from req.user), never a
// userId supplied by the client, so no one can view another user's list.
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// DELETE /wishlist/:productId
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const isInWishlist = req.user.wishlist.some(
      (id) => id.toString() === productId,
    );
    if (!isInWishlist) {
      return res.status(404).json({ message: "Product not in wishlist" });
    }

    req.user.wishlist = req.user.wishlist.filter(
      (id) => id.toString() !== productId,
    );
    await req.user.save();

    res
      .status(200)
      .json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export { addToWishlist, getWishlist, removeFromWishlist };
