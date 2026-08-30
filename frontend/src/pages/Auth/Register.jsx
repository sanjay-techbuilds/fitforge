import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useRegisterMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { FaArrowRight } from "react-icons/fa";

const Register = () => {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const redirect = sp.get("redirect") || "/";

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, redirect, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await register({ username, email, password }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate(redirect);
        toast.success("User successfully registered");
      } catch (err) {
        console.log(err);
        toast.error(err.data.message);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-black">
      
      {/* LEFT SIDE: Editorial Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        {/* Different image to distinguish from Login page */}
        <img 
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop" 
          alt="Men's Fashion Style" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
          <h2 className="text-white text-5xl font-black uppercase tracking-tighter mb-4">
            Join The <br/> Movement.
          </h2>
          <p className="text-gray-200 text-lg font-light tracking-wide">
            Curated fashion for the ambitious.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-black transition-colors duration-300">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-black text-black dark:text-white tracking-tight uppercase">
              Create Account
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Start your journey with FitForge today.
            </p>
          </div>

          <form onSubmit={submitHandler} className="mt-8 space-y-6">
            
            {/* Name Input */}
            <div className="space-y-1">
              <label 
                htmlFor="name" 
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={username}
                onChange={(e) => setName(e.target.value)}
                // 👇 FIX: Input colors for light mode
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-2 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label 
                htmlFor="email" 
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // 👇 FIX: Input colors for light mode
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-2 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300"
                placeholder="name@example.com"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label 
                htmlFor="password" 
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // 👇 FIX: Input colors for light mode
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-2 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300"
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-1">
              <label 
                htmlFor="confirmPassword" 
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                // 👇 FIX: Input colors for light mode
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-2 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={isLoading}
              type="submit"
              // 👇 FIX: Button colors inverted for light mode
              className="w-full py-4 mt-4 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:opacity-90 transition-opacity duration-300 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <Loader small />
              ) : (
                <>
                  Register <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to={redirect ? `/login?redirect=${redirect}` : "/login"}
                // 👇 FIX: Link color in light mode
                className="font-bold text-black dark:text-white hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;