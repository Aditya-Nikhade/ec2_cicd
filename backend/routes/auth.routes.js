import express from "express";
import { signup, login, logout, googleCallback } from "../controllers/auth.controller.js";
import { authLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import passport from 'passport';

const router = express.Router();

router.post("/signup", registerLimiter, signup);

router.post("/login", authLimiter, login);

router.post("/logout", logout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallback);

export default router;
