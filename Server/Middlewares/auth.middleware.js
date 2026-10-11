import jwt from "jsonwebtoken";
import Customer from "../Models/customer.model.js";

export const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "User is not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};