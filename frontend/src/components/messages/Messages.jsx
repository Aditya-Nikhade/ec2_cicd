import { useEffect, useRef } from "react";
import useGetMessages from "../../hooks/useGetMessages";
import Message from "./Message";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import useListenMessages from "../../hooks/useListenMessages";

const Messages = () => {
	const { messages, loading } = useGetMessages();
	useListenMessages();
	const lastMessageRef = useRef();

	useEffect(() => {
		setTimeout(() => {
			lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
		}, 100);
	}, [messages]);

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
		</div>
	);
};

export default Messages;