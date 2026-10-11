import mongoose from "mongoose";
import Product from "../Models/product.model.js";

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      !image ||
      price === undefined ||
      stock === undefined
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    if (stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ message: "Invalid product data", error: error.message });
  }
};

// GET /products?search=...&category=...
// Both filters are built into a single dynamic query instead of
// separate endpoints, as the lab asks for.
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).select(
      "name price category image stock"
    );

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export { createProduct, getProducts, getProductById };
