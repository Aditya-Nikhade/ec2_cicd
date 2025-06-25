import { createContext, useContext, useState, useMemo } from "react";

export const AuthContext = createContext();

export const useAuthContext = () => {
	return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("chat-user")) || null);

	const value = useMemo(() => ({
		authUser,
		setAuthUser
	}), [authUser]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
