import { Router } from "express";
import { checkout, myOrders } from "../controllers/order.controller.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/checkout", authRequired, checkout);
router.get("/mine", authRequired, myOrders);

export default router;
