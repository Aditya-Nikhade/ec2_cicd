import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const signup = async (req, res) => {
	try {
		const { fullName, username, password } = req.body;

		if (!fullName || !username || !password) {
			return res.status(400).json({ error: "Please provide all required fields" });
		}

		const existingUser = await User.findOne({ username });

		if (existingUser) {
			return res.status(400).json({ error: "Username already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			fullName,
			username,
			password: hashedPassword
		});

		await newUser.save();
		
		// Ensure conversation with Dummy user
		try {
			const Conversation = (await import('../models/conversation.model.js')).default;
			const dummyUser = await User.findOne({ username: 'dummy' });
			if (dummyUser && dummyUser._id.toString() !== newUser._id.toString()) {
				const existingConv = await Conversation.findOne({
					participants: { $all: [newUser._id, dummyUser._id] }
				});
				if (!existingConv) {
					await Conversation.create({ participants: [newUser._id, dummyUser._id] });
				}
				
				// Make them friends
				await User.findByIdAndUpdate(newUser._id, {
					$addToSet: { friends: dummyUser._id }
				});
				await User.findByIdAndUpdate(dummyUser._id, {
					$addToSet: { friends: newUser._id }
				});

				// Emit socket event to Dummy User
				const dummySocketId = getReceiverSocketId(dummyUser._id.toString());
				if (dummySocketId) {
					io.to(dummySocketId).emit("newFriend", { userId: newUser._id, username: newUser.username, fullName: newUser.fullName });
				}
			}
		} catch (e) {
			console.error('Error creating conversation with Dummy user:', e);
		}

		const token = generateTokenAndSetCookie(newUser._id, res);

		res.status(201).json({
			_id: newUser._id,
			fullName: newUser.fullName,
			username: newUser.username,
			token: token
		});
	} catch (error) {
		console.error("Error in signup controller:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			return res.status(400).json({ error: "Please provide all required fields" });
		}

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password);

		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const token = generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			token: token
		});
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const googleCallback = async (req, res) => {
	try {
		// Ensure conversation and friendship with Dummy user
		const Conversation = (await import('../models/conversation.model.js')).default;
		const dummyUser = await User.findOne({ username: 'dummy' });
		const googleUser = req.user;
		if (dummyUser && dummyUser._id.toString() !== googleUser._id.toString()) {
			const existingConv = await Conversation.findOne({
				participants: { $all: [googleUser._id, dummyUser._id] }
			});
			if (!existingConv) {
				await Conversation.create({ participants: [googleUser._id, dummyUser._id] });
			}
			// Make them friends if not already
			const alreadyFriends = dummyUser.friends.includes(googleUser._id);
			if (!alreadyFriends) {
				await User.findByIdAndUpdate(googleUser._id, {
					$addToSet: { friends: dummyUser._id }
				});
				await User.findByIdAndUpdate(dummyUser._id, {
					$addToSet: { friends: googleUser._id }
				});
				// Emit socket event to Dummy User
				const dummySocketId = getReceiverSocketId(dummyUser._id.toString());
				if (dummySocketId) {
					io.to(dummySocketId).emit("newFriend", { userId: googleUser._id, username: googleUser.username, fullName: googleUser.fullName });
				}
			}
		}
	} catch (e) {
		console.error('Error creating conversation/friendship with Dummy user (Google):', e);
	}
	const token = generateTokenAndSetCookie(req.user._id, res);
	res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
};

export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error in logout controller:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};