import { useAuthContext } from "../../context/AuthContext";
import { extractTime } from "../../utils/extractTime";
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import useSendMessage from "../../hooks/useSendMessage";
import { toast } from "react-hot-toast";
import ProfileModal from "../profile/ProfileModal";

const Message = ({ message }) => {
	const { authUser } = useAuthContext();
	const fromMe = message.senderId === authUser._id;
	const formattedTime = extractTime(message.createdAt);
	const chatClassName = fromMe ? "justify-end" : "justify-start";
	const shakeClass = message.shouldShake ? "shake" : "";
	const [showMenu, setShowMenu] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedMessage, setEditedMessage] = useState(message.message);
	const { sendMessage } = useSendMessage();
	const [showProfileModal, setShowProfileModal] = useState(false);

	const handleEdit = async () => {
		if (editedMessage.trim() === message.message) {
			setIsEditing(false);
			return;
		}
		await sendMessage(editedMessage, message._id);
		setIsEditing(false);
		setShowMenu(false);
	};

	const handleDelete = async () => {
		await sendMessage("", message._id, true);
		setShowMenu(false);
	};

	const renderMessageContent = () => {
		if (message.message.startsWith('[File]')) {
			const [, fileName, fileUrl] = message.message.split(' - ');
			const fileExtension = fileName.split('.').pop().toLowerCase();
			
			// Determine file type icon
			let fileIcon = '📄'; // Default document icon
			if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension)) {
				fileIcon = '🖼️';
			} else if (['pdf'].includes(fileExtension)) {
				fileIcon = '📑';
			} else if (['doc', 'docx'].includes(fileExtension)) {
				fileIcon = '📝';
			} else if (['xls', 'xlsx'].includes(fileExtension)) {
				fileIcon = '📊';
			} else if (['zip', 'rar', '7z'].includes(fileExtension)) {
				fileIcon = '🗜️';
			}

			const handleDownload = async (e) => {
				e.preventDefault();
				try {
					const response = await fetch(fileUrl);
					const blob = await response.blob();
					const url = window.URL.createObjectURL(blob);
					const a = document.createElement('a');
					a.href = url;
					a.download = fileName;
					document.body.appendChild(a);
					a.click();
					window.URL.revokeObjectURL(url);
					document.body.removeChild(a);
				} catch (error) {
					console.error('Error downloading file:', error);
					toast.error('Failed to download file');
				}
			};

			return (
				<div className="flex flex-col gap-1">
					<button 
						onClick={handleDownload}
						className="flex items-center gap-3 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors w-full text-left"
					>
						<span className="text-2xl">{fileIcon}</span>
						<div className="flex-1 min-w-0">
							<p className="font-medium truncate">{fileName}</p>
							<p className="text-xs text-gray-400">{fileExtension.toUpperCase()}</p>
						</div>
						<span className="text-xl">⬇️</span>
					</button>
				</div>
			);
		}
		return message.message;
	};

	return (
		<>
			<div className={`flex ${chatClassName} mb-3 group relative`}>
				<div
					className={`flex flex-col ${
						fromMe
							? "bg-gray-50 text-gray-500 rounded-t-xl rounded-r-xl"
							: "bg-gray-600 text-white rounded-t-xl rounded-l-xl"
					} max-w-[75%] px-4 py-2 shadow-md ${shakeClass}`}
				>
					{isEditing ? (
						<div className="flex gap-2">
							<input
								type="text"
								value={editedMessage}
								onChange={(e) => setEditedMessage(e.target.value)}
								className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
								autoFocus
							/>
							<button
								onClick={handleEdit}
								className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
							>
								Save
							</button>
							<button
								onClick={() => {
									setIsEditing(false);
									setEditedMessage(message.message);
								}}
								className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
							>
								Cancel
							</button>
						</div>
					) : (
						<>
							{message.message.startsWith('[File]') ? (
								renderMessageContent()
							) : (
								<p>{message.message}</p>
							)}
							<div className="flex justify-end w-full items-center gap-2">
								<span className={`text-xs mt-1 ${fromMe ? "text-gray-500" : "text-gray-200"}`}>
									{formattedTime}
								</span>
								{fromMe && !message.message.startsWith('[File]') && message.message !== "This message was deleted" && (
									<button
										onClick={() => setShowMenu(!showMenu)}
										className="opacity-0 group-hover:opacity-100 transition-opacity"
									>
										<BsThreeDotsVertical className="w-4 h-4" />
									</button>
								)}
							</div>
						</>
					)}
				</div>

				{/* Message Menu */}
				{showMenu && (
					<div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
						<button
							onClick={() => {
								setIsEditing(true);
								setShowMenu(false);
							}}
							className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
						>
							<FiEdit2 className="w-4 h-4" />
							<span>Edit</span>
						</button>
						<button
							onClick={handleDelete}
							className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
						>
							<FiTrash2 className="w-4 h-4" />
							<span>Delete</span>
						</button>
					</div>
				)}
			</div>

			{/* Profile Modal */}
			{showProfileModal && (
				<ProfileModal
					onClose={() => setShowProfileModal(false)}
					isViewOnly={true}
					user={message.sender}
				/>
			)}
		</>
	);
};

export default Message;