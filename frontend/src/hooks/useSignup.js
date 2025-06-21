import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async ({ fullName, username, password, confirmPassword }) => {
		const success = handleInputErrors({ fullName, username, password, confirmPassword });
		if (!success) return;

		setLoading(true);
		try {
			const res = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { 
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ fullName, username, password }),
			});

			const data = await res.json();
			
			if (!res.ok) {
				let errorMsg = data.error || data.message || "Something went wrong during signup";
				if (res.status === 429) {
					errorMsg = data.message || "Too many requests. Please try again later.";
				}
				throw new Error(errorMsg);
			}
			
			localStorage.setItem("chat-user", JSON.stringify(data));
			setAuthUser(data);
			
			toast.success("Signup successful!");
			
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};

export default useSignup;

function handleInputErrors({ fullName, username, password, confirmPassword }) {
	if (!fullName || !username || !password || !confirmPassword) {
		toast.error("Please fill in all fields");
		return false;
	}

	if (password !== confirmPassword) {
		toast.error("Passwords do not match");
		return false;
	}

	if (password.length < 6) {
		toast.error("Password must be at least 6 characters");
		return false;
	}

	return true;
}
