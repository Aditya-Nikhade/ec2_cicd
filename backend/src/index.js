import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import configurePassport from '../config/passport.js';

import authRoutes from "../routes/auth.routes.js";
import messageRoutes from "../routes/message.routes.js";
import userRoutes from "../routes/user.routes.js";
import friendRoutes from "../routes/friends.routes.js";
import fileRoutes from "../routes/file.routes.js";
import connectToMongoDB from "../db/connectToMongoDB.js";
import { app, server } from "../socket/socket.js";

dotenv.config();

// Passport configuration
configurePassport(passport);

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// Session middleware for passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());

// Dynamic CORS configuration for EC2 deployment
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = [
    corsOrigin,
    corsOrigin.replace('http://', 'https://'), // Allow HTTPS version
    corsOrigin.replace('https://', 'http://'), // Allow HTTP version
    // Add port variations if needed
    corsOrigin.replace(/:\d+/, ''), // Remove port if present
    corsOrigin.replace(/:\d+/, ':80'), // Add port 80
    // Allow backend's own origin for static file serving
    'http://localhost:5000',
    'https://localhost:5000'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow the backend's own origin for static file serving
        if (origin === 'http://localhost:5000' || origin === 'https://localhost:5000') {
            return callback(null, true);
        }
        
        if (allowedOrigins.indexOf(origin) === -1) {
            console.log('CORS blocked origin:', origin);
            console.log('Allowed origins:', allowedOrigins);
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

// Serve static files from the React app
const frontendPath = path.resolve(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// All other GET requests not handled before will return React's index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

server.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Server Running on port ${PORT}`);
});