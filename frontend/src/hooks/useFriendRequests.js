// frontend/src/hooks/useFriendRequests.js
import { useState } from "react";
import toast from "react-hot-toast";
import useGetConversations from "./useGetConversations";

export const useFriendRequests = () => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const { refetchConversations, removeConversation } = useGetConversations();

  const getFriendRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/requests`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error fetching friend requests");
      }
      
      setRequests(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error sending friend request");
      }
      
      toast.success("Friend request sent");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error accepting friend request");
      }
      
      setRequests(requests.filter(request => request._id !== userId));
      await refetchConversations();
      toast.success("Friend request accepted");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const rejectFriendRequest = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error rejecting friend request");
      }
      
      setRequests(requests.filter(request => request._id !== userId));
      toast.success("Friend request rejected");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const unfriendUser = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/friends/unfriend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
        },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error unfriending user");
      }
      
      removeConversation(userId);
      toast.success("User unfriended successfully");
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { 
    loading, 
    requests, 
    getFriendRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    unfriendUser
  };
};