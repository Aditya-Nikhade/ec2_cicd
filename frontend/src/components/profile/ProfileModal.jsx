import { useState, useRef } from "react";
import { IoArrowBack } from "react-icons/io5";
import { FiEdit2 } from "react-icons/fi";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfileModal = ({ onClose, isViewOnly = false, user = null }) => {
	const { authUser, setAuthUser } = useAuthContext();
	const [bio, setBio] = useState(user?.bio || authUser?.bio || "");
	const [isEditingBio, setIsEditingBio] = useState(false);
	const [showImagePreview, setShowImagePreview] = useState(false);
	const fileInputRef = useRef(null);
	const displayUser = user || authUser;

	const handleBioSubmit = async () => {
		try {
			const res = await fetch(`/api/users/${authUser._id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ bio }),
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setAuthUser({ ...authUser, bio });
			setIsEditingBio(false);
			toast.success("Bio updated successfully");
		} catch (error) {
			toast.error(error.message);
		}
	};

	const handleImageClick = () => {
		if (isViewOnly) {
			setShowImagePreview(true);
		} else {
			fileInputRef.current?.click();
		}
	};

	const handleImageChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		try {
			const formData = new FormData();
			formData.append("profilePicture", file);

			const res = await fetch(`/api/users/${authUser._id}/profile-picture`, {
				method: "PUT",
				body: formData,
			});
			const data = await res.json();
			if (data.error) throw new Error(data.error);

			setAuthUser({ ...authUser, profilePicture: data.profilePicture });
			toast.success("Profile picture updated successfully");
		} catch (error) {
			toast.error(error.message);
		}
		e.target.value = "";
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="p-4 border-b border-gray-200 flex items-center gap-3">
					<button
						onClick={onClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors"
					>
						<IoArrowBack className="w-5 h-5" />
					</button>
					<h2 className="text-xl font-semibold">Profile</h2>
				</div>

				{/* Content */}
				<div className="p-4">
					{/* Profile Picture */}
					<div className="relative w-32 h-32 mx-auto mb-4">
						<div
							onClick={handleImageClick}
							className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center text-4xl text-white font-semibold cursor-pointer hover:opacity-90 transition-opacity"
							style={{
								backgroundImage: displayUser.profilePicture ? `url(${displayUser.profilePicture})` : "none",
								backgroundSize: "cover",
								backgroundPosition: "center",
							}}
						>
							{!displayUser.profilePicture && displayUser.fullName[0]}
						</div>
						{!isViewOnly && (
							<>
								<input
									type="file"
									ref={fileInputRef}
									onChange={handleImageChange}
									className="hidden"
									accept="image/*"
								/>
								<button
									onClick={() => fileInputRef.current?.click()}
									className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
								>
									<FiEdit2 className="w-4 h-4" />
								</button>
							</>
						)}
					</div>

					{/* User Info */}
					<div className="text-center mb-4">
						<h3 className="text-xl font-semibold">{displayUser.fullName}</h3>
						<p className="text-gray-500">@{displayUser.username}</p>
					</div>

					{/* Bio */}
					<div className="mb-4">
						<div className="flex items-center justify-between mb-2">
							<h4 className="font-medium">About</h4>
							{!isViewOnly && (
								<button
									onClick={() => setIsEditingBio(!isEditingBio)}
									className="text-blue-500 hover:text-blue-600"
								>
									{isEditingBio ? "Cancel" : "Edit"}
								</button>
							)}
						</div>
						{isEditingBio ? (
							<div className="flex gap-2">
								<textarea
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-gray-400"
									rows="3"
									placeholder="Write something about yourself..."
								/>
								<button
									onClick={handleBioSubmit}
									className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
								>
									Save
								</button>
							</div>
						) : (
							<p className="text-gray-600">{bio || "No bio yet"}</p>
						)}
					</div>
				</div>
			</div>

			{/* Image Preview Modal */}
			{showImagePreview && displayUser.profilePicture && (
				<div
					className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]"
					onClick={() => setShowImagePreview(false)}
				>
					<img
						src={displayUser.profilePicture}
						alt="Profile"
						className="max-w-[90vw] max-h-[90vh] object-contain"
					/>
				</div>
			)}
		</div>
	);
};

export default ProfileModal; 