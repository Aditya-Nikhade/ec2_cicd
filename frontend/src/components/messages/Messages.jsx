import { useEffect, useRef, useState } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import Message from "./Message";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import useListenMessages from "../../hooks/useListenMessages";
import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Messages = () => {
	const { messages, loading } = useGetMessages();
	const { socket } = useSocketContext();
	const { selectedConversation } = useConversation();
	const [typingUsers, setTypingUsers] = useState([]);
	useListenMessages();
	const lastMessageRef = useRef();

	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

	useEffect(() => {
		if (!socket || !selectedConversation) return;

		socket.on("user_typing", ({ userId }) => {
			setTypingUsers(prev => {
				if (!prev.includes(userId)) {
					return [...prev, userId];
				}
				return prev;
			});
		});

		socket.on("user_stop_typing", ({ userId }) => {
			setTypingUsers(prev => prev.filter(id => id !== userId));
		});

		return () => {
			socket.off("user_typing");
			socket.off("user_stop_typing");
		};
	}, [socket, selectedConversation]);

	return (
		<div className="px-4 py-4 bg-white h-full">
			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

			{!loading && messages.length === 0 && (
				<div className="flex items-center justify-center h-full">
					<p className="text-gray-500">Send a message to start the conversation</p>
				</div>
			)}

			{!loading &&
				messages.length > 0 &&
				messages.map((message, idx) => (
					<div key={message._id} ref={idx === messages.length - 1 ? lastMessageRef : null}>
						<Message message={message} />
					</div>
				))}

			{typingUsers.length > 0 && (
				<div className="flex justify-start mb-3">
					<div className="bg-gray-100 text-gray-500 rounded-t-xl rounded-r-xl px-4 py-2 shadow-md">
						<div className="flex space-x-1">
							<span>Typing</span>
							<div className="flex space-x-1">
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
								<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Messages;