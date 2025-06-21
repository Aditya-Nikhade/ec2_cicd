import express from "express";
import { signup, login, logout } from "../controllers/auth.controller.js";
import { authLimiter, registerLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", registerLimiter, signup);

router.post("/login", authLimiter, login);

router.post("/logout", logout);

export default router;
