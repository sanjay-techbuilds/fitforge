// src/components/AuthPromptModal.jsx

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSignInAlt, FaUserPlus, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AuthPromptModal = ({ isOpen, onClose, redirectUrl }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate(`/login?redirect=${redirectUrl}`);
    onClose();
  };

  const handleRegister = () => {
    navigate(`/register?redirect=${redirectUrl}`);
    onClose();
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { y: "-100vh", opacity: 0 },
    visible: { y: "0", opacity: 1, transition: { type: 'spring', stiffness: 120 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[9999]"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="bg-[#1F1F1F] text-white p-8 rounded-2xl shadow-lg w-full max-w-md mx-4 relative"
            variants={modalVariants}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <FaTimes size={20} />
            </button>
            <h2 className="text-2xl font-bold text-center mb-2">Join to Continue</h2>
            <p className="text-gray-400 text-center mb-8">Please log in or create an account to add items to your cart.</p>
            
            <div className="space-y-4">
              <button
                onClick={handleLogin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <FaSignInAlt />
                <span>Login</span>
              </button>
              <button
                onClick={handleRegister}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <FaUserPlus />
                <span>Register</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthPromptModal;
