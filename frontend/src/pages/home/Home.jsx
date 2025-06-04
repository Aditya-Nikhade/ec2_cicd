import MessageContainer from "../../components/messages/MessageContainer";
import Sidebar from "../../components/sidebar/Sidebar";

const Home = () => {
	return (
		<div className="flex h-screen w-screen overflow-hidden absolute inset-0">
			<Sidebar />
			<MessageContainer />
		</div>
	);
};

export default Home;
