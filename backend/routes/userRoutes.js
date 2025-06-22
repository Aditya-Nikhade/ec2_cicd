import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { updateUser, updateProfilePicture } from "../controllers/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.put("/:id", protectRoute, updateUser);
router.put("/:id/profile-picture", protectRoute, upload.single("profilePicture"), updateProfilePicture);

export default router; 