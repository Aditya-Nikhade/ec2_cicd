import { useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import useConversation from "../../zustand/useConversation";
import useGetConversations from "../../hooks/useGetConversations";
import toast from "react-hot-toast";

const SearchInput = () => {
	const [search, setSearch] = useState("");
	const { setSelectedConversation } = useConversation();
	const { conversations } = useGetConversations();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!search) return;
		if (search.length < 3) {
			return toast.error("Search term must be at least 3 characters long");
		}

		const conversation = conversations.find((c) => c.fullName.toLowerCase().includes(search.toLowerCase()));

		if (conversation) {
			setSelectedConversation(conversation);
			setSearch("");
		} else toast.error("No such user found!");
	};

	return (
		<form onSubmit={handleSubmit} className="p-4">
			<div className="relative">
				<input
					type="text"
					placeholder="Search users..."
					className="w-full bg-white border border-gray-200 text-gray-700 text-sm rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-purple-500"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
					<IoSearchSharp className="text-gray-400 text-lg hover:text-purple-500 transition-colors" />
				</button>
			</div>
		</form>
	);
};

export default SearchInput;


