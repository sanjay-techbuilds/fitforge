// frontend/src/components/VisualSearch.jsx
import React, { useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';

import { setResults, setStatus } from '../redux/features/visualSearch/visualSearchSlice';
import { addToCart } from '../redux/features/cart/cartSlice';
import ProductCard from '../pages/Products/ProductCard';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ImageUploader } from './ImageUploader';
import { ImagePreview } from './ImagePreview';

function getCroppedImg(image, crop) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
  return canvas;
}

const VisualSearch = () => {
  const dispatch = useDispatch();
  const { results, status, model } = useSelector((state) => state.visualSearch);
  const [viewState, setViewState] = useState('UPLOADING');
  const [imgSrc, setImgSrc] = useState('');

  const handleFileSelect = (file) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setImgSrc(reader.result?.toString() || '');
      setViewState('PREVIEW');
    });
    reader.readAsDataURL(file);
  };

  const handleSearch = async (imageElement, cropData) => {
    setViewState('SEARCHING');
    dispatch(setStatus('Analyzing your selection...'));
    let imageToProcess = imageElement;
    if (cropData) {
      imageToProcess = getCroppedImg(imageElement, cropData);
    }
    try {
        const tensor = tf.browser.fromPixels(imageToProcess).resizeNearestNeighbor([224, 224]).toFloat().div(255.0).expandDims();
        const embedding = model.predict(tensor);
        const vector = embedding.arraySync()[0];
        tf.dispose([tensor, embedding]);
        dispatch(setStatus('Finding similar items...'));
        const response = await fetch('/api/search/visual-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vector }),
        });
        if (!response.ok) {
            throw new Error('Server responded with an error.');
        }
        const matches = await response.json();
        if (Array.isArray(matches)) {
            dispatch(setResults(matches));
            dispatch(setStatus(matches.length > 0 ? `Found ${matches.length} matching items.` : "No similar items found. Try another image!"));
            setViewState('RESULTS');
        } else {
            throw new Error('Received invalid data from the server.');
        }
    } catch (error) {
        console.error("Search failed:", error);
        dispatch(setStatus("An error occurred. Please check your connection and try again."));
        setViewState('ERROR'); // 👈 Go to an ERROR state instead of resetting
    }
  };
  
  const handleCancel = () => {
    setImgSrc('');
    dispatch(setResults([])); // Clear previous results from Redux
    setViewState('UPLOADING');
  };

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added to cart");
  };

  return (
    <div className="visual-search-container">
      <AnimatePresence mode="wait">
        {viewState === 'UPLOADING' && <ImageUploader onFileSelect={handleFileSelect} key="uploader" />}
        {viewState === 'PREVIEW' && <ImagePreview imgSrc={imgSrc} onSearch={handleSearch} onCancel={handleCancel} key="preview" />}
        {viewState === 'SEARCHING' && (
          <div className="results-grid" key="searching">
            {Array.from({ length: 8 }).map((_, index) => <LoadingSkeleton key={index} />)}
          </div>
        )}
        {viewState === 'RESULTS' && (
          <motion.div key="results" className="results-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={handleCancel} className="start-over-btn">Search Another Image</button>
            <p className="status-text">{status}</p>
            <div className="results-grid">
              {Array.isArray(results) && results.map(product => (
                <ProductCard key={product._id} p={product} handleAddToCart={addToCartHandler} />
              ))}
            </div>
          </motion.div>
        )}
        {viewState === 'ERROR' && ( // 👈 New error handling UI
            <motion.div key="error" className="error-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="uploader-text">Something went wrong</p>
                <p className="status-text">{status}</p>
                <button onClick={handleCancel} className="start-over-btn">Try Again</button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VisualSearch;