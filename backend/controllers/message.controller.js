import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import { getCachedMessages, cacheMessages, addMessageToCache, clearMessageCache } from "../db/redis.js";
import User from "../models/user.model.js";

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const { id: receiverId } = req.params;
		const senderId = req.user._id;

		// Check if users are friends
		const sender = await User.findById(senderId);
		if (!sender.friends.includes(receiverId)) {
			return res.status(403).json({ error: "You are not friends with this user." });
		}

		let conversation = await Conversation.findOne({
			participants: { $all: [senderId, receiverId] },
		});

		if (!conversation) {
			conversation = await Conversation.create({
				participants: [senderId, receiverId],
			});
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		await Promise.all([conversation.save(), newMessage.save()]);

		// Add message to Redis cache
		await addMessageToCache(conversation._id.toString(), newMessage);
		console.log(`[Redis] Cached new message for conversation ${conversation._id}`);

		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", newMessage);
		}

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { id: userToChatId } = req.params;
		const senderId = req.user._id;

		const conversation = await Conversation.findOne({
			participants: { $all: [senderId, userToChatId] },
		});

		if (!conversation) return res.status(200).json([]);

		// Try to get messages from Redis cache first
		const cachedMessages = await getCachedMessages(conversation._id.toString());
		
		if (cachedMessages && cachedMessages.length > 0) {
			console.log(`[Redis] Cache HIT: Retrieved ${cachedMessages.length} messages for conversation ${conversation._id}`);
			return res.status(200).json(cachedMessages);
		}

		console.log(`[Redis] Cache MISS: No cached messages found for conversation ${conversation._id}`);

		// If no cache, get from MongoDB and cache the results
		const populatedConversation = await conversation.populate("messages");
		const messages = populatedConversation.messages;

		// Cache the messages for future requests
		await cacheMessages(conversation._id.toString(), messages);
		console.log(`[Redis] Cached ${messages.length} messages from MongoDB for conversation ${conversation._id}`);

		res.status(200).json(messages);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const editMessage = async (req, res) => {
	try {
		const { id: messageId } = req.params;
		const { message } = req.body;
		const userId = req.user._id;

		const messageToEdit = await Message.findById(messageId);
		if (!messageToEdit) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Check if the user is the sender of the message
		if (messageToEdit.senderId.toString() !== userId.toString()) {
			return res.status(403).json({ error: "Not authorized to edit this message" });
		}

		messageToEdit.message = message;
		await messageToEdit.save();

		// Clear message cache for this conversation
		const conversation = await Conversation.findOne({
			messages: messageId
		});
		if (conversation) {
			await clearMessageCache(conversation._id.toString());
			console.log(`[Redis] Cleared message cache for conversation ${conversation._id} after edit`);
		}

		// Emit socket event for real-time update
		const receiverSocketId = getReceiverSocketId(messageToEdit.receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageEdited", messageToEdit);
		}

		res.status(200).json(messageToEdit);
	} catch (error) {
		console.log("Error in editMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const deleteMessage = async (req, res) => {
	try {
		const { id: messageId } = req.params;
		const userId = req.user._id;

		const messageToDelete = await Message.findById(messageId);
		if (!messageToDelete) {
			return res.status(404).json({ error: "Message not found" });
		}

		// Check if the user is the sender of the message
		if (messageToDelete.senderId.toString() !== userId.toString()) {
			return res.status(403).json({ error: "Not authorized to delete this message" });
		}

		messageToDelete.message = "This message was deleted";
		await messageToDelete.save();

		// Clear message cache for this conversation
		const conversation = await Conversation.findOne({
			messages: messageId
		});
		if (conversation) {
			await clearMessageCache(conversation._id.toString());
			console.log(`[Redis] Cleared message cache for conversation ${conversation._id} after deletion`);
		}

		// Emit socket event for real-time update
		const receiverSocketId = getReceiverSocketId(messageToDelete.receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("messageDeleted", messageToDelete);
		}

		res.status(200).json(messageToDelete);
	} catch (error) {
		console.log("Error in deleteMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
