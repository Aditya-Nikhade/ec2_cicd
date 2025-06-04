const MessageSkeleton = () => {
	return (
		<div className="flex items-center gap-3 p-2 animate-pulse">
			<div className="w-8 h-8 rounded-full bg-gray-200"></div>
			<div className="flex-1">
				<div className="h-2 bg-gray-200 rounded-full w-40 mb-2"></div>
				<div className="h-2 bg-gray-200 rounded-full w-32"></div>
			</div>
		</div>
	);
};

export default MessageSkeleton;
