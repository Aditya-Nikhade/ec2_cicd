// backend/routes/friend.routes.js
import express from "express";
import { 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest,
  getFriendRequests,
  getFriends,
  unfriendUser
} from "../controllers/friend.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send", protectRoute, sendFriendRequest);
router.post("/accept", protectRoute, acceptFriendRequest);
router.post("/reject", protectRoute, rejectFriendRequest);
router.post("/unfriend", protectRoute, unfriendUser);
router.get("/requests", protectRoute, getFriendRequests);
router.get("/list", protectRoute, getFriends);

export default router;