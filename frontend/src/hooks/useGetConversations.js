import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";

const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const [conversations, setConversations] = useState([]);
	const { authUser } = useAuthContext();
	const { updateTrigger } = useConversation();

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

	return { loading, conversations, refetchConversations: getConversations, removeConversation };
};

export default useGetConversations;
