import express from "express";
import { registerCustomer, loginCustomer, getMyProfile, logoutCustomer } from "../Controllers/customer.controller.js";
import { isAuthenticated } from "../Middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);

customerRoutes.post("/login", loginCustomer);

customerRoutes.get("/me", isAuthenticated, getMyProfile);

customerRoutes.post("/logout", isAuthenticated, logoutCustomer);


export default customerRoutes;