import { useState, useEffect, useRef } from "react";
import {
  AiOutlineHome,
  AiOutlineShopping,
  AiOutlineShoppingCart,
  AiOutlineLogin,
  AiOutlineUserAdd,
} from "react-icons/ai";
import { FaHeart, FaTachometerAlt, FaBox, FaTags, FaClipboardList, FaUsers, FaUserCircle, FaSignOutAlt, FaTshirt, FaSearch } from "react-icons/fa";
import { Link, NavLink, useNavigate } from "react-router-dom";
import "./Navigation.css";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../../redux/api/usersApiSlice";
import { logout } from "../../redux/features/auth/authSlice";
import { LuShirt } from "react-icons/lu";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

import ThemeToggle from "../../components/ThemeToggle";

const SidebarLink = ({ to, icon, text }) => (
  <NavLink to={to} className="nav-link">
    {/* Icon wrapper to ensure size consistency */}
    <span className="nav-icon">{icon}</span>
    <span className="nav-item-name">{text}</span>
    <span className="nav-tooltip">{text}</span>
  </NavLink>
);

const Navigation = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileButtonRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const closeDropdown = () => setDropdownOpen(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      style={{ zIndex: 9999 }}
      // 👇 FIX: Main container background & border variable
      className="xl:flex lg:flex md:hidden sm:hidden flex-col justify-between text-[var(--text-main)] bg-[var(--bg-grad-2)] border-r border-[var(--input-border)] h-[100vh] fixed transition-colors duration-300"
      id="navigation-container"
      onMouseLeave={closeDropdown}
    >
      {/* Top Section */}
      <div>
        <Link to="/" className="nav-logo">
          {/* 👇 FIX: Logo color variable */}
          <FaTshirt size={26} className="text-primary-500 nav-logo-icon" />
          <span className="nav-item-name text-xl font-bold text-[var(--text-main)]">FitForge</span>
        </Link>
        
        <div className="flex flex-col space-y-2 px-2">
          <SidebarLink to="/" icon={<AiOutlineHome size={22} />} text="HOME" />
          <SidebarLink to="/shop" icon={<AiOutlineShopping size={22} />} text="SHOP" />
          <SidebarLink to="/try-on" icon={<FaSearch size={18} />} text="Visual Search" />
          
          <NavLink to="/cart" className="nav-link relative">
            <span className="nav-icon"><AiOutlineShoppingCart size={22} /></span>
            <span className="nav-item-name">Cart</span>
            <span className="nav-tooltip">Cart</span>
            {cartItems.length > 0 && (
              <div className="absolute top-1 right-2 bg-primary-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {cartItems.reduce((a, c) => a + c.qty, 0)}
              </div>
            )}
          </NavLink>

          <SidebarLink to="/favorite" icon={<FaHeart size={18} />} text="Favorites" />
          <hr className="border-[var(--input-border)] my-4" />
          <SidebarLink to="/contact" icon={<IoChatbubbleEllipsesOutline size={22} />} text="CONTACT" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="relative p-2 border-t border-[var(--input-border)]">
        
        <div className="mb-2">
           <ThemeToggle />
        </div>

        {userInfo ? (
          <>
            <button onClick={toggleDropdown} className="w-full flex items-center focus:outline-none nav-profile-btn" ref={profileButtonRef}>
              <span className="nav-icon"><FaUserCircle size={22} /></span>
              <span className="nav-item-name ml-2 text-[var(--text-main)]">{userInfo.username}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`nav-item-name h-4 w-4 ml-auto text-[var(--text-muted)] transition-transform ${dropdownOpen ? "transform rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>
            
            {dropdownOpen && (
              // 👇 FIX: Dropdown background, text & border variables
              <ul ref={dropdownRef} className="absolute left-0 bottom-full mb-2 w-48 bg-[var(--card-bg)] text-[var(--text-main)] shadow-lg rounded-md border border-[var(--input-border)] z-50">
                {userInfo.isAdmin && (
                  <>
                    <li><Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><FaTachometerAlt /> Dashboard</Link></li>
                    <li><Link to="/admin/productlist" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><FaBox /> Products</Link></li>
                    <li><Link to="/admin/categorylist" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><FaTags /> Category</Link></li>
                    <li><Link to="/admin/orderlist" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><FaClipboardList /> Orders</Link></li>
                    <li><Link to="/admin/userlist" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><FaUsers /> Users</Link></li>
                    <hr className="border-[var(--input-border)] my-1" />
                  </>
                )}
                <li><Link to="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><FaUserCircle /> Profile</Link></li>
                {!userInfo.isAdmin && (
                  <li><Link to="/size-profile" className="flex items-center gap-3 px-4 py-2 hover:bg-[var(--bg-grad-3)]"><LuShirt /> My Size Profile</Link></li>
                )}
                <hr className="border-[var(--input-border)] my-1" />
                <li><button onClick={logoutHandler} className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-[var(--bg-grad-3)] text-red-500"><FaSignOutAlt /> Logout</button></li>
              </ul>
            )}
          </>
        ) : (
          <div className="flex flex-col space-y-2 px-2">
            <SidebarLink to="/login" icon={<AiOutlineLogin size={22} />} text="LOGIN" />
            <SidebarLink to="/register" icon={<AiOutlineUserAdd size={22} />} text="REGISTER" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navigation;