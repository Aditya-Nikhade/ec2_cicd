import useGetConversations from "../../hooks/useGetConversations";
import Conversation from "./Conversation";

const Conversations = () => {
	const { loading, conversations } = useGetConversations();

	return (
		<div className="flex-1 overflow-y-auto bg-white/60">
			{loading && (
				<span className="loading loading-spinner mx-auto"></span>
			)}

			{!loading && conversations.length === 0 && (
				<div className="flex items-center justify-center h-full">
					<p className="text-gray-400">No conversations yet</p>
				</div>
			)}

			{!loading && conversations.length > 0 && (
				<div className="flex flex-col py-2">
					{conversations.map((conversation, idx) => (
						<Conversation
							key={conversation._id}
							conversation={conversation}
							lastIdx={idx === conversations.length - 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default Conversations;


