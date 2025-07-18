import express from "express";
import { getMessages, sendMessage, editMessage, deleteMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.put("/:id", protectRoute, editMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
