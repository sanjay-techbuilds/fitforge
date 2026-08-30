// frontend/src/components/ImageUploader.jsx
import React, { useRef } from 'react';
import { FaImage } from 'react-icons/fa';
import { motion } from 'framer-motion';

export const ImageUploader = ({ onFileSelect }) => {
  const fileInputRef = useRef(null);
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <motion.div
      className="uploader-container"
      onClick={() => fileInputRef.current.click()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
      <div className="uploader-content">
        <FaImage className="uploader-icon" />
        <p className="uploader-text">Drag & Drop or Click to Upload</p>
        <p className="uploader-subtext">Find clothing that matches your style</p>
      </div>
    </motion.div>
  );
};