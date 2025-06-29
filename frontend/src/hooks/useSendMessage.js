import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { messages, setMessages, selectedConversation } = useConversation();

	const sendMessage = async (message, messageId = null, isDelete = false) => {
		setLoading(true);
		try {
			const endpoint = messageId 
				? `/api/messages/${messageId}`
				: `/api/messages/send/${selectedConversation._id}`;

			const method = isDelete ? "DELETE" : (messageId ? "PUT" : "POST");
			const body = messageId && !isDelete
				? { message }
				: (typeof message === 'string' ? { message } : message);

			const res = await fetch(endpoint, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: method !== "DELETE" ? JSON.stringify(body) : undefined,
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			if (messageId) {
				// Update existing message
				setMessages(messages.map(msg => 
					msg._id === messageId 
						? isDelete 
							? { ...msg, message: "This message was deleted" }
							: { ...msg, ...(typeof message === 'string' ? { message } : message) }
						: msg
				));
			} else {
				// Add new message
				setMessages([...messages, data]);
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export default useSendMessage;
