import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user._id).populate("friends", "fullName username");

		if (!currentUser) {
			return res.status(404).json({ error: "User not found" });
		}

		// Always include Dummy user in the friends list, except for Dummy user itself
		const dummyUser = await User.findOne({ username: 'dummy' }).select('fullName username _id');
		let friends = currentUser.friends.map(f => f.toObject ? f.toObject() : f);
		if (dummyUser && currentUser.username !== 'dummy' && !friends.some(f => f._id.toString() === dummyUser._id.toString())) {
			friends = [dummyUser, ...friends];
		}
		// If current user is Dummy, remove Dummy from friends list if present
		if (currentUser.username === 'dummy') {
			friends = friends.filter(f => f._id.toString() !== dummyUser._id.toString());
		}
		res.status(200).json(friends);
		return;
	} catch (error) {
		console.error("Error in getUsersForSidebar: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getUserProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
// backend/controllers/user.controller.js
// Add this function to your existing user controller

export const searchUsers = async (req, res) => {
	try {
		const { username } = req.query;
		const userId = req.user._id;

		if (!username) {
			return res.status(400).json({ error: "Username is required" });
		}

		// Find users whose username contains the search term
		// Exclude the current user and users who are already friends
		const currentUser = await User.findById(userId);
		
		const users = await User.find({
			username: { $regex: username, $options: "i" },
			_id: { $nin: [...currentUser.friends, userId] }
		}).select("fullName username");

		res.status(200).json(users);
	} catch (error) {
		console.error("Error in searchUsers: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};