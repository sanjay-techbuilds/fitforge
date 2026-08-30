// frontend/src/pages/VisualSearchPage.jsx
import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { setModel, setStatus } from '../redux/features/visualSearch/visualSearchSlice';
import VisualSearch from '../components/VisualSearch';
import '../components/VisualSearch.css'; 

const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1';

const VisualSearchPage = () => {
    const dispatch = useDispatch();
    const model = useSelector((state) => state.visualSearch.model);
    const status = useSelector((state) => state.visualSearch.status);

    useEffect(() => {
        if (!model) {
            dispatch(setStatus('Loading AI model...'));
            tf.loadGraphModel(MODEL_URL, { fromTFHub: true }).then(loadedModel => {
                dispatch(setModel(loadedModel));
                dispatch(setStatus(''));
            });
        }
    }, [dispatch, model]);

    return (
        // 👇 FIX 1: Added background variable & min-height so the whole page changes color
        <div className="visual-search-page-container min-h-screen bg-[var(--bg-grad-1)] flex flex-col items-center pt-10">
          <motion.h1
            // 👇 FIX 2: Added 'text-[var(--text-main)]' to force text color to switch
            className="visual-search-title text-4xl font-bold mb-8 text-[var(--text-main)]"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Search by Image
          </motion.h1>

          {status.includes('Loading AI') ? (
            // 👇 FIX 3: Added muted text color for loading
            <p className="uploader-text text-[var(--text-muted)] text-lg">{status}</p>
          ) : (
            <VisualSearch />
          )}
        </div>
    );
};

export default VisualSearchPage;