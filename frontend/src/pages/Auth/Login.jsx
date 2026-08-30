import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../../components/Loader";
import { useLoginMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import { toast } from "react-toastify";
import { FaArrowRight } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [login, { isLoading }] = useLoginMutation();
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
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white dark:bg-black">
      
      {/* LEFT SIDE: Editorial Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=2148&auto=format&fit=crop" 
          alt="Men's Fashion" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-12">
          <h2 className="text-white text-5xl font-black uppercase tracking-tighter mb-4">
            Redefine <br/> Your Style.
          </h2>
          <p className="text-gray-200 text-lg font-light tracking-wide">
            Premium menswear for the modern gentleman.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-white dark:bg-black transition-colors duration-300">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            {/* 👇 FIX: Heading color */}
            <h1 className="text-4xl font-black text-black dark:text-white tracking-tight uppercase">
              Welcome Back
            </h1>
            {/* 👇 FIX: Subtext color */}
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Please sign in to access your FitForge wardrobe.
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // 👇 FIX: Input colors for light mode
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-3 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300 text-base"
                placeholder="name@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label 
                htmlFor="password" 
                className="block text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // 👇 FIX: Input colors for light mode
                className="w-full border-b-2 border-gray-300 dark:border-gray-700 bg-transparent py-3 text-black dark:text-white focus:border-black dark:focus:border-white focus:outline-none transition-colors duration-300 text-base"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                // 👇 FIX: Text color in light mode
                className="text-xs font-semibold text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                FORGOT PASSWORD?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              // 👇 FIX: Button colors inverted for light mode
              className="w-full py-4 bg-black text-white dark:bg-white dark:text-black font-bold uppercase tracking-widest hover:opacity-90 transition-opacity duration-300 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <Loader small />
              ) : (
                <>
                  Sign In <FaArrowRight />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Not a member?{" "}
              <Link
                to={redirect ? `/register?redirect=${redirect}` : "/register"}
                // 👇 FIX: Link color in light mode
                className="font-bold text-black dark:text-white hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;