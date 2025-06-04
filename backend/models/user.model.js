// backend/models/user.model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    friendRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    sentRequests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;