const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require('cors');

const authRoutes = require("./routes/auth.routes");
const messageRoutes = require("./routes/message.routes");
const userRoutes = require("./routes/user.routes");
const friendRoutes = require("./routes/friends.routes");
const connectToMongoDB = require("./db/connectToMongoDB");
const { app, server } = require("./socket/socket");

dotenv.config();

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: "http://localhost:5173",
	credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

server.listen(PORT, () => {
	connectToMongoDB();
	console.log(`Server Running on port ${PORT}`);
});
