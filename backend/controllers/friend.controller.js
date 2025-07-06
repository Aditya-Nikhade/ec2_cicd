// backend/controllers/friend.controller.js
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import Conversation from "../models/conversation.model.js";

// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === userId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }
    // Check if users exist
    const receiver = await User.findById(userId);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request already sent
    if (receiver.friendRequests.includes(senderId) || 
        sender.sentRequests.includes(userId)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Check if already friends
    if (receiver.friends.includes(senderId) || 
        sender.friends.includes(userId)) {
      return res.status(400).json({ error: "Already friends" });
    }

    // Add to friend requests
    await User.findByIdAndUpdate(userId, {
      $push: { friendRequests: senderId }
    });

    // Add to sent requests
    await User.findByIdAndUpdate(senderId, {
      $push: { sentRequests: userId }
    });

    // Emit socket event to receiver
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("friendRequestReceived", { senderId });
    }

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const receiverId = req.user._id;

    // Check if users exist
    const sender = await User.findById(userId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request exists
    if (!receiver.friendRequests.includes(userId)) {
      return res.status(400).json({ error: "No friend request from this user" });
    }

    // Add to friends for both users
    await User.findByIdAndUpdate(userId, {
      $push: { friends: receiverId },
      $pull: { sentRequests: receiverId }
    });

    await User.findByIdAndUpdate(receiverId, {
      $push: { friends: userId },
      $pull: { friendRequests: userId }
    });

    // Emit socket event to sender
    const senderSocketId = getReceiverSocketId(userId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestAccepted", { receiverId });
    }

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const receiverId = req.user._id;

    // Remove from friend requests
    await User.findByIdAndUpdate(receiverId, {
      $pull: { friendRequests: userId }
    });

    // Remove from sent requests
    await User.findByIdAndUpdate(userId, {
      $pull: { sentRequests: receiverId }
    });

    // Emit socket event to sender
    const senderSocketId = getReceiverSocketId(userId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestRejected", { receiverId });
    }

    res.status(200).json({ message: "Friend request rejected" });
  } catch (error) {
    console.error("Error in rejectFriendRequest: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate("friendRequests", "fullName username")
      .select("friendRequests");
    
    res.status(200).json(user.friendRequests);
  } catch (error) {
    console.error("Error in getFriendRequests: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get friends
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId)
      .populate("friends", "fullName username")
      .select("friends");
    
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getFriends: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Unfriend user
export const unfriendUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    // Block unfriend if either user is Dummy
    const User = (await import('../models/user.model.js')).default;
    const userToUnfriend = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);
    if (userToUnfriend?.username === 'dummy' || currentUser?.username === 'dummy') {
      return res.status(400).json({ error: 'Cannot unfriend' });
    }

    // Check if users exist
    if (!userToUnfriend || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if they are friends
    if (!currentUser.friends.includes(userId) || !userToUnfriend.friends.includes(currentUserId)) {
      return res.status(400).json({ error: "Users are not friends" });
    }

    // Remove from friends for both users
    await User.findByIdAndUpdate(userId, {
      $pull: { friends: currentUserId }
    });

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { friends: userId }
    });

    // Delete conversation between the two users
    await Conversation.findOneAndDelete({
      participants: { $all: [userId, currentUserId] }
    });

    // Emit socket event to both users
    const userToUnfriendSocketId = getReceiverSocketId(userId);
    if (userToUnfriendSocketId) {
      io.to(userToUnfriendSocketId).emit("unfriended", { userId: currentUserId });
    }
    const currentUserSocketId = getReceiverSocketId(currentUserId);
    if (currentUserSocketId) {
      io.to(currentUserSocketId).emit("unfriended", { userId });
    }

    res.status(200).json({ message: "Successfully unfriended user" });
  } catch (error) {
    console.error("Error in unfriendUser: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};