import { useSocketContext } from "../../context/SocketContext";
import useConversation from "../../zustand/useConversation";

const Conversation = ({ conversation, lastIdx }) => {
	const { selectedConversation, setSelectedConversation } = useConversation();
	const isSelected = selectedConversation?._id === conversation._id;
	const { onlineUsers } = useSocketContext();
	const isOnline = conversation._id ? onlineUsers.includes(conversation._id) : false;

	const handleSelect = () => {
		if (selectedConversation?._id === conversation._id) {
			return; // Don't reselect if already selected
		}
		setSelectedConversation({
			...conversation,
			isFriend: true // Since this is from the friends list
		});
	};

	return (
		<>
			<div
				className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
					isSelected ? "bg-gray-100" : "hover:bg-gray-50"
				}`}
				onClick={handleSelect}>
				<div className="relative flex-shrink-0">
					<div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center text-lg text-white font-semibold">
						{conversation.fullName[0]}
					</div>
					<span
						className={`absolute bottom-0 right-0 w-3 h-3 ${
							isOnline ? "bg-green-500" : "bg-gray-300"
						} rounded-full ring-2 ring-white`}
					></span>
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="text-gray-700 font-medium truncate">{conversation.fullName}</h3>
					<p className="text-sm text-gray-500">{isOnline ? "Active Now" : "Offline"}</p>
				</div>
			</div>
			{!lastIdx && <div className="border-b border-gray-100" />}
		</>
	);
};

export default Conversation;