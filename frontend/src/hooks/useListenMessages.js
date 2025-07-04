import { useEffect } from "react";

import { useSocketContext } from "../context/SocketContext";
import useConversation from "../zustand/useConversation";

import notificationSound from "../assets/sounds/notification.mp3";

const useListenMessages = () => {
	console.log("useListenMessages hook is running"); // Add this line
	const { socket } = useSocketContext();
	const { messages, setMessages } = useConversation();

	useEffect(() => {
		socket?.on("newMessage", (newMessage) => {
			console.log("New message received:", newMessage); // Add this line
			newMessage.shouldShake = true;
			const sound = new Audio(notificationSound);
			sound.play();
			setMessages([...messages, newMessage]);
		});

		socket?.on("messageEdited", (editedMessage) => {
			setMessages(messages.map(msg => 
				msg._id === editedMessage._id ? editedMessage : msg
			));
		});

		socket?.on("messageDeleted", (deletedMessage) => {
			setMessages(messages.map(msg => 
				msg._id === deletedMessage._id ? deletedMessage : msg
			));
		});

		return () => {
			socket?.off("newMessage");
			socket?.off("messageEdited");
			socket?.off("messageDeleted");
		};
	}, [socket, setMessages, messages]);
};

export default useListenMessages;
