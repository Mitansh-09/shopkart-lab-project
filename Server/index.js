import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import customerRoutes from "./Routes/customer.routes.js";
import productRoutes from "./Routes/product.routes.js";
import wishlistRoutes from "./Routes/wishlist.routes.js";
import cartRoutes from "./Routes/cart.routes.js";
import orderRoutes from "./Routes/order.routes.js";

// Load .env from this file's own folder (Server/), not from whatever
// directory the process happens to be started in. This is what was
// causing "dbUrl" and "JWT_SECRET" to come through as undefined when
// the server was launched from the project root.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });

const app = express();

const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// Serve the production client from the same origin as the API. Keeping both
// parts on one origin lets the HttpOnly login cookie work without third-party
// cookie settings in the browser.
const clientBuildPath = join(__dirname, "../Client/vite-project/dist");
app.use(express.static(clientBuildPath));
app.use((req, res, next) => {
  if (req.method === "GET" && req.accepts("html")) {
    return res.sendFile(join(clientBuildPath, "index.html"));
  }
  next();
});

mongoose.connect(process.env.dbUrl)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
