import { Router } from "express";
import { checkout, myOrders } from "../controllers/order.controller.js";
import { authRequired } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/checkout", authRequired, asyncHandler(checkout));
router.get("/mine", authRequired, asyncHandler(myOrders));

export default router;
