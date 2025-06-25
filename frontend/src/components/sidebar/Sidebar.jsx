import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import { useAuthContext } from "../../context/AuthContext";
import FriendRequests from "./FriendRequests";
import UserSearch from "./UserSearch";
import { useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import ProfileModal from "../profile/ProfileModal";

const Sidebar = () => {
	const { authUser } = useAuthContext();
	const [activeTab, setActiveTab] = useState("chats");
	const [showProfileModal, setShowProfileModal] = useState(false);

	return (
		<div className="flex flex-col w-[400px] bg-gray-50 h-screen border-r border-gray-200">
			{/* User Profile */}
			<div className="p-4 border-b border-gray-200 bg-white">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div
							className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity"
							style={{
								backgroundImage: authUser.profilePicture ? `url(${authUser.profilePicture})` : "none",
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
							onClick={() => setShowProfileModal(true)}
						>
							{!authUser.profilePicture && authUser.fullName[0]}
						</div>
						<button
							onClick={() => setShowProfileModal(true)}
							className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
						>
							<FiEdit2 className="w-3 h-3" />
						</button>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="text-gray-700 font-semibold truncate">{authUser.fullName}</h3>
						<p className="text-sm text-gray-500 truncate">@{authUser.username}</p>
					</div>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-gray-200">
				<button 
					className={`flex-1 py-3 text-center ${activeTab === "chats" ? "text-gray-700 font-medium border-b-2 border-gray-700" : "text-gray-500"}`}
					onClick={() => setActiveTab("chats")}
				>
					Chats
				</button>
				<button 
					className={`flex-1 py-3 text-center ${activeTab === "requests" ? "text-gray-700 font-medium border-b-2 border-gray-700" : "text-gray-500"}`}
					onClick={() => setActiveTab("requests")}
				>
					Requests
				</button>
				<button 
					className={`flex-1 py-3 text-center ${activeTab === "find" ? "text-gray-700 font-medium border-b-2 border-gray-700" : "text-gray-500"}`}
					onClick={() => setActiveTab("find")}
				>
					Find
				</button>
			</div>

			{/* Content based on active tab */}
			<div className="flex-1 overflow-y-auto bg-white">
				<div style={{ display: activeTab === "chats" ? "block" : "none" }}>
					<SearchInput />
					<Conversations />
				</div>
				<div style={{ display: activeTab === "requests" ? "block" : "none" }}>
					<FriendRequests />
				</div>
				<div style={{ display: activeTab === "find" ? "block" : "none" }}>
					<UserSearch />
				</div>
			</div>

			{/* Logout Button */}
			<div className="border-t border-gray-200 p-4 bg-white">
				<LogoutButton />
			</div>

			{/* Profile Modal */}
			{showProfileModal && (
				<ProfileModal onClose={() => setShowProfileModal(false)} />
			)}
		</div>
	);
};

export default Sidebar;