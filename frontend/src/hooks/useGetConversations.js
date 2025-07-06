import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";
import { useSocketContext } from "../context/SocketContext";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);
	const { authUser } = useAuthContext();
	const { updateTrigger, selectedConversation, clearSelectedConversation } = useConversation();
	const { socket } = useSocketContext();

	const getConversations = useCallback(async () => {
		if (!authUser) return;
		
		setLoading(true);
		try {
			const res = await fetch(`/api/users`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${authUser.token}`
				}
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Failed to fetch conversations");
			}

			// Remove Dummy user injection. Only use backend data.
			setConversations(data);
			if (selectedConversation && !data.some(conv => conv._id === selectedConversation._id)) {
				clearSelectedConversation();
			}
		} catch (error) {
			toast.error(error.message);
			console.error("Error fetching conversations:", error);
		} finally {
			setLoading(false);
		}
	}, [authUser, selectedConversation, clearSelectedConversation]);

	const removeConversation = useCallback((userId) => {
		setConversations(prev => prev.filter(conv => conv._id !== userId));
	}, []);

	useEffect(() => {
		getConversations();
	}, [authUser, updateTrigger, getConversations]);

	useEffect(() => {
		if (!socket) return;
		const handleUnfriended = ({ userId }) => {
			removeConversation(userId);
			getConversations();
		};
		const handleFriendRequestAccepted = () => {
			getConversations();
		};
		const handleNewFriend = ({ userId, username, fullName }) => {
			getConversations();
		};
		socket.on("unfriended", handleUnfriended);
		socket.on("friendRequestAccepted", handleFriendRequestAccepted);
		socket.on("newFriend", handleNewFriend);
		return () => {
			socket.off("unfriended", handleUnfriended);
			socket.off("friendRequestAccepted", handleFriendRequestAccepted);
			socket.off("newFriend", handleNewFriend);
		};
	}, [socket, removeConversation, getConversations]);

	return { loading, conversations, refetchConversations: getConversations, removeConversation };
};

export default useGetConversations;
