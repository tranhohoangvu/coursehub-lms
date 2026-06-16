import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, me);

export default router;
