import SearchInput from "./SearchInput";
import Conversations from "./Conversations";
import LogoutButton from "./LogoutButton";
import { useAuthContext } from "../../context/AuthContext";
import FriendRequests from "./FriendRequests";
import UserSearch from "./UserSearch";
import { useState } from "react";

const Sidebar = () => {
	const { authUser } = useAuthContext();
	const [activeTab, setActiveTab] = useState("chats");

	return (
		<div className="flex flex-col w-[400px] bg-gray-50 h-screen border-r border-gray-200">
			{/* User Profile */}
			<div className="p-4 border-b border-gray-200 bg-white">
				<div className="flex items-center gap-3">
					<div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl text-white font-semibold">
						{authUser.fullName[0]}
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
			{activeTab === "chats" && (
				<>
					<SearchInput />
					<div className="flex-1 overflow-y-auto bg-white">
						<Conversations />
					</div>
				</>
			)}

			{activeTab === "requests" && <FriendRequests />}
			
			{activeTab === "find" && <UserSearch />}

			{/* Logout Button */}
			<div className="border-t border-gray-200 p-4 bg-white">
				<LogoutButton />
			</div>
		</div>
	);
};

export default Sidebar;