import { useState } from "react";
import { Link } from "react-router-dom";
import useLogin from "../../hooks/useLogin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { loading, login } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ username, password });
  };

  const handleGoogleLogin = () => {
    window.location.href = `/api/auth/google`;
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

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-start justify-center px-8 lg:px-16 xl:px-24">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <h1 className="text-[2rem] font-medium text-[rgb(0,30,43)] mb-8">
            Log in to your account
          </h1>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full h-12 rounded-md border border-gray-300 px-4"
                placeholder="Enter your username"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 rounded-md border border-gray-300 px-4"
                placeholder="Enter your password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 hover:cursor-pointer bg-[#00ED64] hover:bg-[#00C957] text-black font-medium rounded-md mt-4"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2 ">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative bg-white px-2 text-sm text-gray-500">OR</div>
          </div>

          {/* Google Sign-In Button */}
          <Button
            onClick={handleGoogleLogin}
            className="cursor-pointer w-full h-12 flex items-center justify-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
          >
            <img src="/google.png" alt="Google icon" className="h-11 w-11 object-contain" />
            <span>Sign in with Google</span>
          </Button>

          {/* Login as Dummy Button */}
          <Button
            onClick={async () => await login({ username: 'dummy', password: 'dummy' })}
            className="cursor-pointer w-full h-12 flex items-center justify-center gap-1 bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 rounded-md mt-2"
          >
            <span>Login as Dummy User</span>
          </Button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="text-gray-600">Don&apos;t have an account? </span>
            <Link to="/signup" className="text-blue-600 hover:underline font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;