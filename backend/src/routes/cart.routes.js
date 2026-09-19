import { Router } from "express";
import { addToCart, getCart, removeFromCart, getCartCount } from "../controllers/cart.controller.js";
import { authRequired } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/count", authRequired, asyncHandler(getCartCount));
router.get("/", authRequired, asyncHandler(getCart));
router.post("/items", authRequired, asyncHandler(addToCart));
router.delete("/items/:courseId", authRequired, asyncHandler(removeFromCart));

export default router;
