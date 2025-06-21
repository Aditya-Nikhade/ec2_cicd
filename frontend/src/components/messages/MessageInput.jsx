import { useState, useEffect, useRef } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();
	const { socket } = useSocketContext();
	const { selectedConversation } = useConversation();
	const typingTimeoutRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;

		await sendMessage(message);
		setMessage("");

		// Stop typing indicator when message is sent
		if (socket && selectedConversation) {
			socket.emit("typing_stop", { receiverId: selectedConversation._id });
		}
	};

	const handleTyping = () => {
		if (socket && selectedConversation) {
			socket.emit("typing_start", { receiverId: selectedConversation._id });
			
			// Clear existing timeout
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
			
			// Set new timeout to stop typing indicator
			typingTimeoutRef.current = setTimeout(() => {
				socket.emit("typing_stop", { receiverId: selectedConversation._id });
			}, 2000);
		}
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, []);

	return (
		<form className="px-4 py-3 bg-white border-t border-gray-100" onSubmit={handleSubmit}>
			<div className="flex items-center gap-2">
				<input
					type="text"
					className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-gray-400"
					placeholder="Type a message..."
					value={message}
					onChange={(e) => {
						setMessage(e.target.value);
						handleTyping();
					}}
					onBlur={() => {
						if (socket && selectedConversation) {
							socket.emit("typing_stop", { receiverId: selectedConversation._id });
						}
					}}
				/>
				<button
					type="submit"
					className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
					disabled={loading || !message}
				>
					<BsSend className="w-5 h-5 text-white" />
				</button>
			</div>
		</form>
	);
};

export default MessageInput;