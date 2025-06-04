import { BiLogOut } from "react-icons/bi";
import useLogout from "../../hooks/useLogout";

const LogoutButton = () => {
	const { loading, logout } = useLogout();

	return (
		<button
			onClick={logout}
			className="flex hover:cursor-pointer items-center justify-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg w-full"
			disabled={loading}
		>
			<BiLogOut className="w-6 h-6 text-white" />
			<span className="text-lg">{loading ? "Logging out..." : "Logout"}</span>
		</button>
	);
};

export default LogoutButton;
