import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const connectToMongoDB = async () => {
	try {
		// Log the URI being used (remove sensitive info)
		console.log("Attempting to connect to MongoDB...");
		
		if (!process.env.MONGO_DB_URI) {
			throw new Error("MONGODB_URI is not defined in environment variables");
		}

		await mongoose.connect(process.env.MONGO_DB_URI);
		console.log("Connected to MongoDB successfully");
	} catch (error) {
		console.error("MongoDB connection error:", error.message);
		// Throw the error to be caught by the server
		throw error;
	}
};

export default connectToMongoDB;
