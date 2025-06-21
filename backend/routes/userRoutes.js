const express = require("express");
const { protectRoute } = require("../middleware/protectRoute");
const { updateUser, updateProfilePicture } = require("../controllers/userController");
const upload = require("../middleware/upload");

const router = express.Router();

router.put("/:id", protectRoute, updateUser);
router.put("/:id/profile-picture", protectRoute, upload.single("profilePicture"), updateProfilePicture);

module.exports = router; 