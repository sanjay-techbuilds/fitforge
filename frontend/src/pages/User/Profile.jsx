import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaUserCircle, FaBox, FaKey, FaSave } from "react-icons/fa";
import { Link } from "react-router-dom";

import Loader from "../../components/Loader";
import { useProfileMutation } from "../../redux/api/usersApiSlice";
import { setCredentials } from "../../redux/features/auth/authSlice";
import AdminMenu from "../Admin/AdminMenu";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { userInfo } = useSelector((state) => state.auth);
  const [updateProfile, { isLoading: isUpdating }] = useProfileMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (userInfo) {
      setUsername(userInfo.username);
      setEmail(userInfo.email);
    }
  }, [userInfo]);

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile({ _id: userInfo._id, username, email }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Profile information updated successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!password) {
      toast.error("Password field cannot be empty");
      return;
    }
    try {
      const res = await updateProfile({ _id: userInfo._id, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  const isAdmin = userInfo?.isAdmin;

  // Reusable styles using CSS Variables from index.css
  const inputStyles = "w-full bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelStyles = "block text-sm font-medium text-[var(--text-muted)] mb-1";

  return (
    // 👇 FIX: Theme-aware background and text
    <div className="flex min-h-screen bg-[var(--bg-grad-1)] text-[var(--text-main)]">
      {isAdmin && <AdminMenu />}
      <main className={`flex-1 p-6 lg:p-10 ${!isAdmin ? 'ml-0' : ''}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {/* 👇 FIX: Theme-aware headings */}
            <h1 className="text-3xl font-bold text-[var(--heading-col)]">Account Profile</h1>
            <p className="text-[var(--text-muted)] mt-1">Hello, <span className="text-primary-500">{userInfo.username}!</span> Manage your personal information and preferences.</p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Profile Card */}
            <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              {/* 👇 FIX: Theme-aware card */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg text-center h-full flex flex-col justify-center">
                <FaUserCircle className="text-7xl text-primary-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-[var(--heading-col)]">{userInfo.username}</h2>
                <p className="text-[var(--text-muted)]">{userInfo.email}</p>
                <p className="text-xs text-[var(--text-muted)] opacity-70 mt-2">Member since {new Date(userInfo.createdAt).toLocaleDateString()}</p>
                {/* 👇 FIX: Theme-aware button */}
                <Link to="/profile/orders" className="mt-6 w-full bg-[var(--input-bg)] border border-[var(--input-border)] hover:bg-[var(--bg-grad-3)] text-[var(--text-main)] p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2">
                  <FaBox /> My Orders
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Update Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Information Form */}
              <motion.div 
                className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--heading-col)]"><FaUserCircle /> Personal Information</h3>
                <form onSubmit={handleInfoSubmit}>
                  <div className="mb-4">
                    <label className={labelStyles}>Name</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputStyles} />
                  </div>
                  <div className="mb-4">
                    <label className={labelStyles}>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyles} />
                  </div>
                  <button type="submit" disabled={isUpdating} className="w-full md:w-auto mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                    {isUpdating ? <><Loader size="sm" /> Saving...</> : <><FaSave /> Save Changes</>}
                  </button>
                </form>
              </motion.div>

              {/* Change Password Form */}
              <motion.div 
                className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[var(--heading-col)]"><FaKey /> Change Password</h3>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-4">
                    <label className={labelStyles}>New Password</label>
                    <input type="password" placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${inputStyles} placeholder-[var(--text-muted)]`} />
                  </div>
                  <div className="mb-4">
                    <label className={labelStyles}>Confirm New Password</label>
                    <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.targe.value)} className={`${inputStyles} placeholder-[var(--text-muted)]`} />
                  </div>
                  <button type="submit" disabled={isUpdating} className="w-full md:w-auto mt-2 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                     {isUpdating ? <><Loader size="sm" /> Saving...</> : <><FaKey /> Change Password</>}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;