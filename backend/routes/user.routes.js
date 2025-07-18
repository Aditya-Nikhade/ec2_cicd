import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, searchUsers, getUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", protectRoute, getUserProfile);
router.get("/", protectRoute, getUsersForSidebar);
// backend/routes/user.routes.js
// Add this route to your existing user routes

router.get("/search", protectRoute, searchUsers);
export default router;