import { useState, useEffect, useRef } from "react";
import { BsSend } from "react-icons/bs";
import FileButton from "../ui/FileButton";
import useFileUpload from "../../hooks/useFileUpload";
import useSendMessage from "../../hooks/useSendMessage";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const { uploadFile, uploading } = useFileUpload();
	const { loading, sendMessage } = useSendMessage();
	const { socket } = useSocketContext();
	const { selectedConversation } = useConversation();
	const typingTimeoutRef = useRef(null);
	const { conversations } = useGetConversations();

	// Check if selected user is a friend
	const isFriend = selectedConversation && conversations.some(conv => conv._id === selectedConversation._id);

	const handleFileSelected = async (file) => {
		if (!file || uploading || !isFriend) return;
		const meta = await uploadFile(file);
		if (!meta) return;
		await sendMessage({ ...meta });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;
		if (!isFriend) return;

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
				<FileButton onFileSelected={handleFileSelected} disabled={!isFriend || uploading} />
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
					disabled={!isFriend}
				/>
				<button
					type="submit"
					className="p-2 rounded-full bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
					disabled={loading || !message || !isFriend}
				>
					<BsSend className="w-5 h-5 text-white" />
				</button>
			</div>
			{!isFriend && selectedConversation && (
				<p className="text-red-500 text-xs mt-2">You are not friends with this user. Messaging is disabled.</p>
			)}
		</form>
	);
};

export default MessageInput;