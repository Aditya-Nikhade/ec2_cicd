import { Link } from "react-router-dom";
import { useState } from "react";
import useSignup from "../../hooks/useSignup";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const SignUp = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		password: "",
		confirmPassword: "",
	});

	const { loading, signup } = useSignup();

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Check if all fields are filled
		if (!inputs.fullName || !inputs.username || !inputs.password || !inputs.confirmPassword) {
			toast.error("Please fill in all fields");
			return;
		}
		// Standard password parameters: min 8 chars, upper, lower, digit, special char
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
		if (!passwordRegex.test(inputs.password)) {
			toast.error("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
			return;
		}
		// Check if passwords match
		if (inputs.password !== inputs.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		await signup(inputs);
	};

	return (
		<div className="flex min-h-screen w-full overflow-hidden m-0 p-0 absolute inset-0">
			{/* Left side - Image */}
			<div className="hidden lg:block lg:w-1/2 relative m-0 p-0">
				<img 
					src="/image.png" 
					alt="Background" 
					className="absolute inset-0 w-full h-full object-cover m-0"
				/>
			</div>

			{/* Right side - Sign Up Form */}
			<div className="w-full lg:w-1/2 flex flex-col items-start justify-center px-8 lg:px-16 xl:px-24">
				<div className="w-full max-w-md space-y-6">
					{/* Title */}
					<h1 className="text-[2rem] font-medium text-[rgb(0,30,43)] mb-8">
						Create your account
					</h1>

					{/* Sign Up Form */}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label 
								htmlFor="fullName" 
								className="block text-sm font-medium text-gray-700"
							>
								Full Name
							</label>
							<Input
								id="fullName"
								type="text"
								value={inputs.fullName}
								onChange={(e) => setInputs({ ...inputs, fullName: e.target.value.trim() })}
								required
								className="w-full h-12 rounded-md border border-gray-300 px-4"
								placeholder="John Doe"
							/>
						</div>

						<div className="space-y-2">
							<label 
								htmlFor="username" 
								className="block text-sm font-medium text-gray-700"
							>
								Username
							</label>
							<Input
								id="username"
								type="text"
								value={inputs.username}
								onChange={(e) => setInputs({ ...inputs, username: e.target.value.trim() })}
								required
								className="w-full h-12 rounded-md border border-gray-300 px-4"
								placeholder="johndoe"
							/>
						</div>

						<div className="space-y-2">
							<label 
								htmlFor="password" 
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<Input
								id="password"
								type="password"
								value={inputs.password}
								onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
								required
								className="w-full h-12 rounded-md border border-gray-300 px-4"
								placeholder="Enter password"
							/>
							<p className="text-xs text-gray-500 mt-1">
								Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
							</p>
						</div>

						<div className="space-y-2">
							<label 
								htmlFor="confirmPassword" 
								className="block text-sm font-medium text-gray-700"
							>
								Confirm Password
							</label>
							<Input
								id="confirmPassword"
								type="password"
								value={inputs.confirmPassword}
								onChange={(e) => setInputs({ ...inputs, confirmPassword: e.target.value })}
								required
								className="w-full h-12 rounded-md border border-gray-300 px-4"
								placeholder="Confirm password"
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-12 hover:cursor-pointer bg-[#00ED64] hover:bg-[#00C957] text-black font-medium rounded-md mt-4"
							disabled={loading}
						>
							{loading ? (
								<div className="flex items-center justify-center gap-2">
									<Loader2 className="h-5 w-5 animate-spin" />
									Signing up...
								</div>
							) : (
								"Sign Up"
							)}
						</Button>
					</form>

					{/* Login Link */}
					<div className="text-center mt-6">
						<span className="text-gray-600">Already have an account? </span>
						<Link to="/login" className="text-blue-600 hover:underline font-medium">
							Log in
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignUp;









