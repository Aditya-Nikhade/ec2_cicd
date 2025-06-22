import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';

import authRoutes from "../routes/auth.routes.js";
import messageRoutes from "../routes/message.routes.js";
import userRoutes from "../routes/user.routes.js";
import friendRoutes from "../routes/friends.routes.js";
import fileRoutes from "../routes/file.routes.js";
import connectToMongoDB from "../db/connectToMongoDB.js";
import { app, server } from "../socket/socket.js";

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
	// "http://localhost:5173", // Vite dev server - COMMENTED OUT FOR EC2
	// "http://localhost",      // Docker Nginx frontend - COMMENTED OUT FOR EC2
	// "http://localhost:80",   // COMMENTED OUT FOR EC2
	
	// EC2 Production URLs - UNCOMMENT AND UPDATE WITH YOUR EC2 PUBLIC IP/DOMAIN
	"http://13.235.67.27",           // Replace with your EC2 public IP
	"http://13.235.67.27:80",     // Replace with your EC2 public IP
	"https://13.235.67.27",          // Replace with your EC2 public IP (if using HTTPS)
	// "http://YOUR_DOMAIN.com",              // Replace with your domain (if you have one)
	// "https://YOUR_DOMAIN.com",             // Replace with your domain (if you have one)
];

app.use(cors({
    origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
			return callback(new Error(msg), false);
		}
		return callback(null, true);
	},
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/files", fileRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});