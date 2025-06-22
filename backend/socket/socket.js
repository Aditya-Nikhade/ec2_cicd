import { Server } from "socket.io";
import http from "http";
import express from "express";
import { addOnlineUser, removeOnlineUser, getOnlineUsers } from "../db/redis.js";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: [
			"http://localhost:5173", // Local dev
			"http://localhost"       // Docker
		],
		methods: ["GET", "POST"],
	},
});

export const getReceiverSocketId = (receiverId) => {
	return userSocketMap[receiverId];
};

const userSocketMap = {}; 

io.on("connection", async (socket) => {
	console.log("a user connected", socket.id);

	const userId = socket.handshake.query.userId;
	if (userId != "undefined") {
		userSocketMap[userId] = socket.id;
		// Add user to Redis online users set
		await addOnlineUser(userId);
	}

	// Get online users from Redis and emit
	const onlineUsers = await getOnlineUsers();
	io.emit("getOnlineUsers", onlineUsers);

	// Handle typing events
	socket.on("typing_start", ({ receiverId }) => {
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("user_typing", { userId });
		}
	});

	socket.on("typing_stop", ({ receiverId }) => {
		const receiverSocketId = getReceiverSocketId(receiverId);
		if (receiverSocketId) {
			io.to(receiverSocketId).emit("user_stop_typing", { userId });
		}
	});

	socket.on("disconnect", async () => {
		console.log("user disconnected", socket.id);
		if (userId != "undefined") {
			delete userSocketMap[userId];
			// Remove user from Redis online users set
			await removeOnlineUser(userId);
		}
		// Get updated online users from Redis and emit
		const onlineUsers = await getOnlineUsers();
		io.emit("getOnlineUsers", onlineUsers);
	});
});

export { app, io, server };
