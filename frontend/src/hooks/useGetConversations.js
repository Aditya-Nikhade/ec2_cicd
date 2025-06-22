import { useEffect, useState } from "react";
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

	const getConversations = async () => {
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
	};

	const removeConversation = (userId) => {
		setConversations(prev => prev.filter(conv => conv._id !== userId));
	};

	useEffect(() => {
		getConversations();
	}, [authUser, updateTrigger]);

	useEffect(() => {
		if (!socket) return;
		const handleUnfriended = ({ userId }) => {
			removeConversation(userId);
			getConversations();
		};
		const handleFriendRequestAccepted = () => {
			getConversations();
		};
		socket.on("unfriended", handleUnfriended);
		socket.on("friendRequestAccepted", handleFriendRequestAccepted);
		return () => {
			socket.off("unfriended", handleUnfriended);
			socket.off("friendRequestAccepted", handleFriendRequestAccepted);
		};
	}, [socket]);

	return { loading, conversations, refetchConversations: getConversations, removeConversation };
};

export default useGetConversations;
