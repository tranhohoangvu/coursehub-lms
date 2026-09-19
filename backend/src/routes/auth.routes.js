import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", authRequired, asyncHandler(me));

export default router;
