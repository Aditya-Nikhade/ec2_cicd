import Messages from "./Messages";
import MessageInput from "./MessageInput";
import { TiMessages } from "react-icons/ti";
import useConversation from "../../zustand/useConversation";
import { useFriendRequests } from "../../hooks/useFriendRequests";
import { useState, useEffect } from "react";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";

const MessageContainer = () => {
	const { selectedConversation, setSelectedConversation, triggerConversationUpdate } = useConversation();
	const { onlineUsers } = useSocketContext();
	const [showUnfriendPrompt, setShowUnfriendPrompt] = useState(false);
	const { unfriendUser } = useFriendRequests();
	const isOnline = selectedConversation?._id ? onlineUsers.includes(selectedConversation._id) : false;

	// Clear selected conversation on mount
	useEffect(() => {
		setSelectedConversation(null);
	}, []);

	const handleUnfriend = async () => {
		if (!selectedConversation?._id) return;
		
		try {
			await unfriendUser(selectedConversation._id);
			setSelectedConversation(null);
			setShowUnfriendPrompt(false);
			triggerConversationUpdate(); // Force conversation list refresh
		} catch (error) {
			toast.error(error.message || "Failed to unfriend user");
		}
	};

	return (
		<div className="flex flex-col flex-1 h-screen bg-gray-50">
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					{/* Header */}
					<div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-200">
						<div className="flex items-center gap-3">
							<div className="relative">
								<div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-lg text-white font-semibold">
									{selectedConversation.fullName[0]}
								</div>
								<span
									className={`absolute bottom-0 right-0 w-3 h-3 ${
										isOnline ? "bg-green-500" : "bg-gray-300"
									} rounded-full ring-2 ring-white`}
								></span>
							</div>
							<div>
								<h3 className="text-gray-700 font-medium">{selectedConversation.fullName}</h3>
								<p className="text-sm text-gray-500">{isOnline ? "Active Now" : "Offline"}</p>
							</div>
						</div>
						<button 
							onClick={() => setShowUnfriendPrompt(true)}
							className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors"
						>
							Unfriend
						</button>
					</div>

					{/* Unfriend Prompt */}
					{showUnfriendPrompt && (
						<div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
								<h3 className="text-lg font-semibold text-gray-900 mb-2">Unfriend Confirmation</h3>
								<p className="text-gray-600 mb-4">
									Are you sure you want to unfriend {selectedConversation.fullName}? You won't be able to chat unless you become friends again.
								</p>
								<div className="flex justify-end gap-3">
									<button
										onClick={() => setShowUnfriendPrompt(false)}
										className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleUnfriend}
										className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
									>
										Unfriend
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Messages */}
					<div className="flex-1 overflow-y-auto">
						<Messages />
					</div>

					{/* Message Input */}
					{selectedConversation.isFriend !== false && <MessageInput />}
					{selectedConversation.isFriend === false && (
						<div className="p-4 text-center bg-gray-50 border-t border-gray-200">
							<p className="text-gray-600">You can no longer chat with this person</p>
						</div>
					)}
				</>
			)}
		</div>
	);
};

const NoChatSelected = () => {
	return (
		<div className="flex items-center justify-center h-full bg-gray-50">
			<div className="px-4 text-center">
				<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-4xl text-gray-500 mx-auto mb-4">
					<TiMessages />
				</div>
				<h1 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to Chat App</h1>
				<p className="text-gray-600">Select a chat to start messaging</p>
			</div>
		</div>
	);
};

export default MessageContainer;



