import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "justify-end" : "justify-start";
	const shakeClass = message.shouldShake ? "shake" : "";

	return (
		<div className={`flex ${chatClassName} mb-3`}>
			<div
				className={`flex flex-col ${
					fromMe
						? "bg-gray-50 text-gray-500 rounded-t-xl rounded-r-xl"
						: "bg-gray-600 text-white rounded-t-xl rounded-l-xl"
				} max-w-[75%] px-4 py-2 shadow-md ${shakeClass}`}
			>
				<p>{message.message}</p>
				<div className="flex justify-end w-full">
					<span className={`text-xs mt-1 ${fromMe ? "text-gray-500" : "text-gray-200"}`}>
						{formattedTime}
					</span>
				</div>
			</div>
		</div>
	);
};

export default Message;