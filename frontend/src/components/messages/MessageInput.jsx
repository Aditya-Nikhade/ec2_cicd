import { useState } from "react";
import { BsSend } from "react-icons/bs";
import useSendMessage from "../../hooks/useSendMessage";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message) return;
		await sendMessage(message);
		setMessage("");
	};

	return (
		<form className="px-4 py-3 bg-white border-t border-gray-100" onSubmit={handleSubmit}>
			<div className="flex items-center gap-2">
				<input
					type="text"
					className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-gray-400"
					placeholder="Type a message..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button
					type="submit"
					className="p-2 rounded-full bg-green-600 hover:bg-gray-300 hover:cursor-pointer transition disabled:opacity-50"
					disabled={loading}
				>
					<BsSend className="w-5 h-5 text-white" />
				</button>
			</div>
		</form>
	);
};

export default MessageInput;