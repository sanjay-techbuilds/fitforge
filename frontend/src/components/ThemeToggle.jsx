import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div 
      onClick={toggleTheme}
      className="nav-link cursor-pointer flex items-center p-2 my-2 transition-all hover:bg-opacity-10 hover:bg-gray-500 rounded-md"
      title="Switch Theme"
    >
      {/* Icon Section */}
      <div className="text-xl mr-2">
        {theme === 'dark' ? (
          <FaSun className="text-yellow-400" size={20} /> 
        ) : (
          <FaMoon className="text-blue-600" size={20} />
        )}
      </div>

      {/* Text Section (Matches your SidebarLink style) */}
      <span className="nav-item-name font-medium">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </div>
  );
};

export default ThemeToggle;