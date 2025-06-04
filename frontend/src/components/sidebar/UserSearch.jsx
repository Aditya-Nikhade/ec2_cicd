// frontend/src/components/sidebar/UserSearch.jsx
import { useState } from "react";
import { useFriendRequests } from "../../hooks/useFriendRequests";
import { FaUserPlus } from "react-icons/fa";
import toast from "react-hot-toast";

const UserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const { sendFriendRequest, loading } = useFriendRequests();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?username=${searchTerm}`, {
        headers: {
          "Authorization": `Bearer ${JSON.parse(localStorage.getItem("chat-user")).token}`
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error searching users");
      }
      
      setSearchResults(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Find Friends</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username..."
          className="flex-1 px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !searchTerm.trim()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          Search
        </button>
      </div>
      
      {searching && <div className="flex justify-center py-2">Searching...</div>}
      
      {!searching && searchResults.length === 0 && searchTerm && (
        <p className="text-gray-500 text-sm">No users found</p>
      )}
      
      {!searching && searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-700">{user.fullName}</p>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>
              <button 
                onClick={() => sendFriendRequest(user._id)}
                disabled={loading}
                className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                <FaUserPlus />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;