const User = require("../models/userModel");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const updateUser = async (req, res) => {
	try {
		const { id } = req.params;
		const { bio } = req.body;

		if (id !== req.user._id.toString()) {
			return res.status(403).json({ error: "You are not authorized to update this user" });
		}

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		user.bio = bio;
		await user.save();

		res.status(200).json(user);
	} catch (error) {
		console.error("Error in updateUser controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

const updateProfilePicture = async (req, res) => {
	try {
		const { id } = req.params;

		if (id !== req.user._id.toString()) {
			return res.status(403).json({ error: "You are not authorized to update this user" });
		}

		const user = await User.findById(id);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (!req.file) {
			return res.status(400).json({ error: "No file uploaded" });
		}

		// Upload to cloudinary
		const result = await cloudinary.uploader.upload(req.file.path, {
			folder: "chat-app",
			width: 300,
			crop: "scale",
		});

		// Delete old profile picture if exists
		if (user.profilePicture) {
			const publicId = user.profilePicture.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(publicId);
		}

		// Delete the temporary file
		fs.unlinkSync(req.file.path);

		user.profilePicture = result.secure_url;
		await user.save();

		res.status(200).json({ profilePicture: user.profilePicture });
	} catch (error) {
		// Delete the temporary file if it exists
		if (req.file) {
			fs.unlinkSync(req.file.path);
		}
		console.error("Error in updateProfilePicture controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

module.exports = {
	updateUser,
	updateProfilePicture
}; 