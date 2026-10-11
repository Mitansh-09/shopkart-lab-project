import express from "express";
import { isAuthenticated } from "../Middlewares/auth.middleware.js";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../Controllers/wishlist.controller.js";

const wishlistRoutes = express.Router();

// Every wishlist route needs a logged-in user, so the middleware is
// applied once here instead of repeating it on each route.
wishlistRoutes.use(isAuthenticated);

wishlistRoutes.post("/:productId", addToWishlist);
wishlistRoutes.get("/", getWishlist);
wishlistRoutes.delete("/:productId", removeFromWishlist);

export default wishlistRoutes;
