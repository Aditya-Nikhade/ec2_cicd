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
      required: function() { return this.authProvider === 'local'; },
      minlength: 6,
    },
    email: {
      type: String,
      required: function() { return this.authProvider === 'google'; },
      unique: true,
    },
    gender: {
      type: String,
      required: function() { return this.authProvider === 'google'; },
      enum: ["male", "female"],
    },
    profilePicture: {
      type: String,
      default: "",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, 
    },
    authProvider: {
      type: String,
      required: true,
      enum: ['local', 'google'],
      default: 'local',
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