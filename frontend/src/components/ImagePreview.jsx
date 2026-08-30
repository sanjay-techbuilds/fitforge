// frontend/src/components/ImagePreview.jsx
import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import { FaSearch, FaCrop, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';

// This CSS is CRITICAL for the library to work
import 'react-image-crop/dist/ReactCrop.css'; 

export const ImagePreview = ({ imgSrc, onSearch, onCancel }) => {
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef(null);

  const onImageLoad = (e) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    // Your helper function is correct
    const initialCrop = centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height);
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  };

  const handleSearch = () => {
    // Your search logic is also correct
    onSearch(imgRef.current, isCropping ? completedCrop : null);
  };

  return (
    <motion.div
      className="preview-container"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <div className="preview-image-wrapper">
        {/* --- THIS IS THE FIX --- */}
        {/* 1. We ALWAYS render ReactCrop.
          2. We use the `disabled` prop to turn the cropper UI on or off.
          3. This keeps the <img> tag stable and loaded.
        */}
        <ReactCrop
          crop={crop}
          onChange={(_, p) => setCrop(p)}
          onComplete={(c) => setCompletedCrop(c)}
          disabled={!isCropping}
          aspect={1}
        >
          <img
            ref={imgRef}
            alt="Preview"
            src={imgSrc}
            onLoad={onImageLoad}
          />
        </ReactCrop>
        {/* --- END OF FIX --- */}
      </div>
      
      <div className="preview-actions">
        <button onClick={onCancel} className="action-btn" title="Cancel"><FaTimes /><span>Cancel</span></button>
        <button onClick={() => setIsCropping(!isCropping)} className={`action-btn crop-btn ${isCropping ? 'active' : ''}`} title="Crop Image"><FaCrop /><span>{isCropping ? 'Finish' : 'Crop'}</span></button>
        <button onClick={handleSearch} className="action-btn search-btn" title="Search"><FaSearch /><span>Search</span></button>
      </div>
    </motion.div>
  );
};