import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VscWand } from 'react-icons/vsc';
import Product from '../pages/Products/Product'; // Adjust path if needed

// This is the animated "analyzing" element
const AnalyzingAnimation = () => (
  <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="text-2xl font-semibold text-slate-300"
    >
      <p>Analyzing Your Style Profile...</p>
      <p className="text-sm text-slate-500">Finding your perfect fit.</p>
    </motion.div>
    <div className="w-full max-w-md bg-slate-900/50 rounded-full h-2.5 overflow-hidden">
      <motion.div
        className="bg-primary-500 h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      ></motion.div>
    </div>
  </div>
);

const AIStyleMatrix = ({ products }) => {
  // 'initial', 'analyzing', 'results'
  const [status, setStatus] = useState('initial'); 
  const [curatedProducts, setCuratedProducts] = useState([]);

  const handleAnalyze = () => {
    setStatus('analyzing');

    // Simulate AI analysis and product selection
    setTimeout(() => {
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      setCuratedProducts(shuffled.slice(0, 4)); // Select 4 random products
      setStatus('results');
    }, 3000); // 3-second delay for the animation
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <div className="relative bg-slate-900/50 border border-slate-800 rounded-3xl p-8 md:p-12 min-h-[50vh] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {status === 'initial' && (
          <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center flex flex-col items-center gap-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Perfect Style</span>
            </h2>
            <p className="max-w-xl text-slate-400">
              Not sure where to start? Let our AI-powered style matrix find the perfect items for you based on our top collections.
            </p>
            <button
              onClick={handleAnalyze}
              className="mt-4 flex items-center gap-3 text-lg font-semibold bg-primary-600 px-8 py-4 rounded-full shadow-lg shadow-pink-600/20 hover:scale-105 hover:shadow-xl hover:shadow-pink-600/30 transition-all duration-300"
            >
              <VscWand />
              Curate My Style
            </button>
          </motion.div>
        )}

        {status === 'analyzing' && (
          <motion.div key="analyzing" exit={{ opacity: 0 }}>
            <AnalyzingAnimation />
          </motion.div>
        )}

        {status === 'results' && (
          <motion.div
            key="results"
            className="w-full"
            initial="hidden"
            animate="visible"
          >
            <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold">Your Personalized Picks ✨</h2>
                <p className="text-slate-400 mt-2">We think you'll love these. <button onClick={handleAnalyze} className="text-primary-500 font-semibold hover:underline">Recalibrate?</button></p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {curatedProducts.map((product, i) => (
                <motion.div key={product._id} custom={i} variants={itemVariants}>
                  <Product product={product} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIStyleMatrix;
