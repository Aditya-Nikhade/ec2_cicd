// frontend/src/components/sidebar/FriendRequests.jsx
import { useEffect } from "react";
import { useFriendRequests } from "../../hooks/useFriendRequests";
import { FaCheck, FaTimes } from "react-icons/fa";

const FriendRequests = () => {
  const { 
    loading, 
    requests, 
    getFriendRequests, 
    acceptFriendRequest, 
    rejectFriendRequest 
  } = useFriendRequests();

  useEffect(() => {
    getFriendRequests();
  }, [getFriendRequests]);

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Friend Requests</h3>
      
      {loading && <div className="flex justify-center py-2">Loading...</div>}
      
      {!loading && requests.length === 0 && (
        <p className="text-gray-500 text-sm">No pending friend requests</p>
      )}
      
      {!loading && requests.length > 0 && (
        <div className="space-y-2">
          {requests.map((request) => (
            <div key={request._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-700">{request.fullName}</p>
                <p className="text-sm text-gray-500">@{request.username}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => acceptFriendRequest(request._id)}
                  className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FaCheck />
                </button>
                <button 
                  onClick={() => rejectFriendRequest(request._id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >   
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;