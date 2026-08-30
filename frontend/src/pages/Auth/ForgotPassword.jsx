import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const submitHandler = (e) => {
    e.preventDefault();
    // Add your password reset logic here
    console.log("Reset link sent to:", email);
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-black">
      
      {/* LEFT SIDE: Editorial Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img 
          src="https://image.pollinations.ai/prompt/mystery%20man%20silhouette%20looking%20at%20city%20lights%20night%20rain%20fashion%20photography%20cinematic?width=1080&height=1920&nologo=true" 
          alt="Recover Access" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-90 hover:scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-12">
          <h2 className="text-white text-5xl font-black uppercase tracking-tighter mb-4">
            Recover <br/> Access.
          </h2>
          <p className="text-gray-200 text-lg font-light tracking-wide">
            Secure your wardrobe.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-black transition-colors duration-300">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-black dark:text-white tracking-tight uppercase">
              Forgot Password?
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={submitHandler} className="mt-10 space-y-8">
            
            {/* Email Field */}
            <div className="space-y-2">
              <label 
                htmlFor="email" 
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-3 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300 text-base"
                placeholder="name@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:opacity-90 transition-opacity duration-300 flex justify-center items-center gap-2"
            >
              Send Reset Link <FaArrowRight />
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="font-bold text-black dark:text-white hover:underline"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;