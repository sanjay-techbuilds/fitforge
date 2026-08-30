// src/pages/Products/ProductDetails.jsx

import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
  useGetProductsQuery, 
  useLazyGetRecommendedSizeQuery, 
} from "../../redux/api/productApiSlice";
import { motion, AnimatePresence } from "framer-motion";

import Loader from "../../components/Loader";
import Message from "../../components/Message";
import HeartIcon from "./HeartIcon";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";
import AuthPromptModal from "../../components/AuthPromptModal";
import RelatedProducts from "./RelatedProducts"; 

import { FaArrowLeft } from "react-icons/fa"; 
import { FiCheck, FiZap, FiShield, FiWind, FiSun } from "react-icons/fi";
import { TbWashMachine, TbIroning3, TbTemperatureOff, TbCircleLetterX } from "react-icons/tb";

const getReviewSentiment = (rating) => {
  if (rating >= 4) return { text: "Positive", color: "text-green-400" };
  if (rating === 3) return { text: "Neutral", color: "text-yellow-400" };
  return { text: "Negative", color: "text-red-400" };
};

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [userProfile, setUserProfile] = useState(null); 
  const [suggestedSize, setSuggestedSize] = useState("");
  const [suggestedConfidence, setSuggestedConfidence] = useState("");
  const [recommendationReason, setRecommendationReason] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const { data: product, isLoading, refetch, error } = useGetProductDetailsQuery(productId);
  const { data: productsData } = useGetProductsQuery({}); 
  const { userInfo } = useSelector((state) => state.auth);
  const [createReview, { isLoading: loadingProductReview }] = useCreateReviewMutation();
  const [
    triggerGetRecommendation,
    { data: recommendationData, error: recommendationError },
  ] = useLazyGetRecommendedSizeQuery();
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userInfo) {
        setUserProfile(null); 
        return;
      }
      try {
        const { data } = await axios.get("/api/sizeprofile", { withCredentials: true });
        setUserProfile(data || null); 
      } catch (err) {
        setUserProfile(null); 
      }
    };
    fetchProfile();
  }, [userInfo, productId]); 

  useEffect(() => {
    if (userProfile && product) {
      triggerGetRecommendation(productId);
    }
  }, [userProfile, product, productId, triggerGetRecommendation]);

  useEffect(() => {
    if (recommendationData) {
      setSuggestedSize(recommendationData.size);
      setSuggestedConfidence(recommendationData.confidence);
      setRecommendationReason(recommendationData.reason);
      
      if (!size && recommendationData.size) { 
        setSize(String(recommendationData.size));
      }
    } else if (recommendationError) {
      setSuggestedSize("");
      setSuggestedConfidence("");
      setRecommendationReason("");
    }
  }, [recommendationData, recommendationError, size]); 
  
  const submitHandler = async (e) => {
     e.preventDefault();
    if (rating === 0 || !comment.trim()) { toast.error("Please provide both a rating and a comment."); return; }
    try {
      await createReview({ productId, rating, comment }).unwrap();
      refetch(); toast.success("Review submitted successfully!"); setRating(0); setComment("");
    } catch (err) { toast.error(err?.data?.message || err.message || "Failed to submit review."); }
  };
  
  const addToCartHandler = () => {
    if (!userInfo) { setIsAuthModalOpen(true); return; }
    if (!size) { toast.error("Please select a size first."); return; }
    
    const selectedSizeStock = product.inventory?.find(item => String(item.size) === String(size))?.countInStock || 0;
    if (selectedSizeStock < qty) {
      toast.error(`Only ${selectedSizeStock} in stock for size ${size}.`);
      return;
    }

    dispatch(addToCart({ ...product, qty, size })); 
    toast.success(`${product.name} (${size}) added to cart!`);
  };

  const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" } }) };
  const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

  const keyFeatures = [
    { icon: FiWind, title: "Breathable Fabric", description: "Stay cool and comfortable all day long." },
    { icon: FiZap, title: "Quick Dry", description: "Wicks moisture away for rapid evaporation." },
    { icon: FiShield, title: "Durable Build", description: "Made with high-quality materials for longevity." },
    { icon: FiSun, title: "UV Protection", description: "Helps protect your skin during outdoor activities." },
    ].filter(f => f.title && f.description);

  const materials = product?.material || "Premium Cotton Blend"; 
  const careInstructions = [
      { icon: TbWashMachine, text: "Machine wash cold (Max 30°C)" },
      { icon: TbTemperatureOff, text: "Do not bleach" },
      { icon: TbIroning3, text: "Iron on low heat if needed" },
      { icon: TbCircleLetterX, text: "Do not dry clean" },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 overflow-x-hidden py-8 text-[var(--text-main)]">
      <AuthPromptModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} redirectUrl={`/product/${productId}`} />

      <div className="py-4">
        <motion.div initial="hidden" animate="visible" variants={fadeIn}>
          <Link to="/shop" className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Shop
          </Link>
        </motion.div>
       </div>

      {(() => {
        if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><Loader /></div>;
        if (error) return <Message variant="danger">{error?.data?.message || error.message || "Could not load product details."}</Message>;
        if (!product) return <Message variant="danger">Product not found.</Message>;

        return (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start mt-4">
              
              {/* Image Section */}
              <motion.div className="lg:col-span-6 relative group" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
                <div className="overflow-hidden rounded-2xl shadow-2xl bg-[var(--card-bg)] aspect-[4/5] relative bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }}>
                  <div className="absolute inset-0 backdrop-blur-lg bg-black/40"></div>
                  <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-contain transition-transform duration-500 ease-in-out group-hover:scale-105" />
                </div>
                <div className="absolute top-5 right-5 z-10"><HeartIcon product={product} /></div>
               </motion.div>

              {/* Details Section */}
              <motion.div className="flex flex-col lg:col-span-6 pt-4 lg:pt-0" variants={staggerContainer} initial="hidden" animate="visible">
                <motion.span variants={fadeIn} className="text-primary-500 font-semibold uppercase tracking-wider text-sm">{product.brand}</motion.span>
                <motion.h1 variants={fadeIn} className="text-3xl lg:text-4xl font-bold text-[var(--text-main)] break-words mt-1 leading-tight">{product.name}</motion.h1>
                <motion.div variants={fadeIn} className="my-4 flex items-center justify-between gap-4">
                  <Ratings value={product.rating} text={`${product.numReviews} review${product.numReviews !== 1 ? 's' : ''}`} />
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${product.countInStock > 0 ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                    {product.countInStock > 5 ? 'In Stock' : product.countInStock > 0 ? `Low Stock (Total ${product.countInStock})` : 'Out of Stock'}
                  </span>
                </motion.div>
                <motion.p variants={fadeIn} className="text-5xl font-extrabold text-primary-500 my-4">₹ {product.price}</motion.p>
                <motion.p variants={fadeIn} className="text-[var(--text-muted)] leading-relaxed my-4 break-words">{product.description}</motion.p>
                
                {/* Recommendation Block - FIXED WITH !IMPORTANT TO OVERRIDE GLOBAL STYLES */}
                <AnimatePresence>
                  {suggestedSize && (
                    <motion.div 
                      // 👇 FIXED: Added !text-green-900 to FORCE the text color
                      className="mb-4 p-4 rounded-lg border bg-green-100 border-green-300 !text-green-900 dark:bg-green-900/30 dark:border-green-700 dark:!text-green-100"
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <span>
                        Recommended Size: 
                        {/* 👇 FIXED: Added !text-green-900 */}
                        <strong className="text-lg font-bold !text-green-900 dark:!text-white ml-1">{suggestedSize}</strong> 
                        <span className="ml-1">({suggestedConfidence})</span>
                      </span>
                      {recommendationReason && (
                        // 👇 FIXED: Added !text-green-800
                        <span className="block text-xs font-medium !text-green-800 dark:!text-green-300 mt-1">
                          {recommendationReason}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {userInfo && !userProfile && !suggestedSize && (
                    <motion.div 
                      className="mb-4 p-3 rounded-lg bg-[var(--card-bg)] backdrop-blur-md border border-[var(--card-border)] text-sm text-[var(--text-main)] flex items-center justify-between gap-3" 
                      initial={{ opacity: 0, y: -10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <span>Get a smart size recommendation.</span>
                      <button 
                        onClick={() => navigate("/size-profile")} 
                        className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shadow-md hover:shadow-lg transition-shadow"
                      >
                        Add Measurements
                      </button>
                    </motion.div>
                  )}

                  {recommendationData?.size === null && recommendationReason && (
                        <motion.div 
                        // 👇 FIXED: Added !text-yellow-900
                        className="mb-4 p-4 rounded-lg backdrop-blur-md border bg-yellow-50 border-yellow-200 !text-yellow-900 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:!text-yellow-200" 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                      >
                          <span className="block text-xs font-medium !text-yellow-800 dark:!text-yellow-300/80">{recommendationReason}</span>
                      </motion.div>
                  )}
                </AnimatePresence>
                
                <motion.div variants={fadeIn} className="my-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-lg text-[var(--text-main)]">Select Size:</h3>
                    {product.sizeChart && product.sizeChart.length > 0 && (
                      <button className="text-sm text-primary-500 hover:underline font-medium" onClick={() => setShowSizeChart(true)}>
                        View Size Chart
                      </button>
                    )}
                  </div>
                  
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {(product.sizes && product.sizes.length > 0) ? (
                      product.sizes.map((s) => (
                        <button 
                          key={s} 
                          onClick={() => setSize(String(s))}
                          disabled={(product.inventory?.find(i => String(i.size) === String(s))?.countInStock || 0) === 0}
                          className={`relative flex items-center justify-center h-12 w-12 rounded-full text-sm font-bold border-2 transition-all duration-300 group 
                            ${String(size) === String(s) 
                              ? "bg-primary-600 border-primary-500 text-white scale-105 shadow-lg shadow-primary-600/30" 
                              : "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-main)] hover:border-primary-500 hover:bg-[var(--bg-grad-2)]"} 
                            ${String(suggestedSize) === String(s) && String(size) !== String(s)
                              ? "border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/50 animate-pulse" 
                              : "" }
                            disabled:opacity-40 disabled:bg-[var(--bg-grad-3)] disabled:border-[var(--input-border)] disabled:cursor-not-allowed disabled:hover:border-[var(--input-border)] relative`}
                        >
                          {String(size) === String(s) && (
                            <motion.div className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <FiCheck className="w-5 h-5" />
                            </motion.div>
                          )}
                          <span className={`transition-opacity ${String(size) === String(s) ? 'opacity-0' : 'opacity-100'}`}>{s}</span>
                          
                          {(product.inventory?.find(i => String(i.size) === String(s))?.countInStock || 0) === 0 && (
                            <span className="absolute w-full h-0.5 bg-red-500/70 rotate-[-45deg] scale-125"></span>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">Sizes not available for this product.</p>
                    )}
                  </div>
                </motion.div>
                
                <motion.div variants={fadeIn} className="flex gap-4 mt-8 items-end">
                  {product.countInStock > 0 && (
                    <div className="w-1/4 min-w-[70px]">
                      <label htmlFor="qty" className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Quantity</label>
                      <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))} className="p-4 w-full h-[58px] rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none text-center font-semibold">
                        {[...Array(Math.min(product.inventory?.find(i => String(i.size) === String(size))?.countInStock || 10, 10)).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <button onClick={addToCartHandler} disabled={product.countInStock === 0 || !size} className="flex-1 h-[58px] bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-800 transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                    {product.countInStock === 0 ? "Out of Stock" : !size ? "Select a Size" : "Add To Cart"}
                  </button>
                </motion.div>
              </motion.div> 
            </div> 

            {/* Key Features Section */}
            {keyFeatures.length > 0 && (
              <motion.div className="my-16 lg:my-20 bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl p-8 lg:p-10 border border-[var(--card-border)]" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
                <motion.h2 variants={fadeIn} className="text-2xl lg:text-3xl font-bold text-[var(--text-main)] mb-8 text-center">Why You'll Love It</motion.h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  {keyFeatures.slice(0, 4).map((feature, index) => (
                      <motion.div key={index} className="flex flex-col items-center text-center p-6 bg-[var(--bg-grad-2)] rounded-lg border border-[var(--input-border)] transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg" variants={fadeIn}>
                          <div className="p-4 bg-gradient-to-br from-primary-600/30 to-primary-700/40 rounded-full mb-4 shadow-inner"><feature.icon className="w-7 h-7 text-primary-500" /></div>
                          <h4 className="font-semibold text-lg text-[var(--text-main)] mb-2">{feature.title}</h4>
                          <p className="text-sm text-[var(--text-muted)] leading-relaxed">{feature.description}</p>
                      </motion.div>
                   ))}
                </div>
              </motion.div>
            )}

            {/* Materials & Care Section */}
            <motion.div className="my-16 lg:my-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
              <motion.div variants={fadeIn} className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl p-8 border border-[var(--card-border)] h-full"> <h3 className="text-xl lg:text-2xl font-bold text-[var(--text-main)] mb-4">Materials</h3><p className="text-[var(--text-muted)] leading-relaxed">{materials}</p> </motion.div>
              <motion.div variants={fadeIn} className="bg-[var(--card-bg)] backdrop-blur-md rounded-2xl shadow-xl p-8 border border-[var(--card-border)] h-full"> <h3 className="text-xl lg:text-2xl font-bold text-[var(--text-main)] mb-6">Care Instructions</h3><div className="space-y-4">{careInstructions.map((instr, index) => (<div key={index} className="flex items-center gap-4"><instr.icon className="w-6 h-6 text-primary-500 flex-shrink-0" /><span className="text-[var(--text-muted)] text-sm">{instr.text}</span></div>))}</div> </motion.div>
            </motion.div>

            {/* Reviews Section */}
            <motion.div className="my-16 lg:my-20" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeIn}>
              <ProductTabs loadingProductReview={loadingProductReview} userInfo={userInfo} submitHandler={submitHandler} rating={rating} setRating={setRating} comment={comment} setComment={setComment} product={product} reviewSentimentFn={getReviewSentiment} />
            </motion.div>

            {/* Related Products Section */}
            <motion.div 
              className="my-16 lg:my-20"
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.1 }} 
              variants={fadeIn}
            >
              <RelatedProducts 
                currentProduct={product} 
                allProducts={productsData?.products || []} 
              />
            </motion.div>

            {/* Size Chart Modal */}
            <AnimatePresence>
              {showSizeChart && (
                <motion.div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div className="bg-[var(--card-bg)] p-8 rounded-xl shadow-2xl w-full max-w-3xl relative overflow-hidden max-h-[90vh]" initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                      <h3 className="text-2xl font-bold mb-6 text-[var(--text-main)] text-center">{product.name} - Size Chart</h3>
                      <div className="overflow-y-auto max-h-[70vh]">
                        
                        {(product.sizeChart && product.sizeChart.length > 0 && product.sizeChart[0].length) ? (
                          // SHOE CHART
                          <table className="w-full text-left border-collapse min-w-[300px]">
                            <thead>
                              <tr className="border-b-2 border-[var(--input-border)]">
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Size</th>
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Foot Length (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.sizeChart.map((s) => (
                                <tr key={s.size} className="border-b border-[var(--input-border)] hover:bg-[var(--bg-grad-2)]">
                                  <td className="px-4 py-3 text-[var(--text-muted)] font-medium">{s.size}</td>
                                  <td className="px-4 py-3 text-[var(--text-muted)]">{s.length?.join(" - ") || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          // CLOTHING CHART (Fallback)
                          <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                              <tr className="border-b-2 border-[var(--input-border)]">
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Size</th>
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Height (cm)</th>
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Chest (cm)</th>
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Waist (cm)</th>
                                <th className="px-4 py-3 text-[var(--text-main)] font-semibold">Hips (cm)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {product.sizeChart.map((s) => (
                                <tr key={s.size} className="border-b border-[var(--input-border)] hover:bg-[var(--bg-grad-2)]">
                                  <td className="px-4 py-3 text-[var(--text-muted)] font-medium">{s.size}</td>
                                  <td className="px-4 py-3 text-[var(--text-muted)]">{s.height?.join(" - ") || 'N/A'}</td>
                                  <td className="px-4 py-3 text-[var(--text-muted)]">{s.chest?.join(" - ") || 'N/A'}</td>
                                  <td className="px-4 py-3 text-[var(--text-muted)]">{s.waist?.join(" - ") || 'N/A'}</td>
                                  <td className="px-4 py-3 text-[var(--text-muted)]">{s.hips?.join(" - ") || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        
                      </div>
                    <button className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] text-2xl" onClick={() => setShowSizeChart(false)} aria-label="Close size chart">&times;</button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </>
        );
      })()}
    </div>
  );
};

export default ProductDetails;