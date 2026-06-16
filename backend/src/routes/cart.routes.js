import { Router } from "express";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.get("/", authRequired, getCart);
router.post("/items", authRequired, addToCart);
router.delete("/items/:courseId", authRequired, removeFromCart);

export default router;
