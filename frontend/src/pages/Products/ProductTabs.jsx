import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const tabs = ["All Reviews", "Write Your Review"];

const ProductTabs = ({
  loadingProductReview,
  userInfo,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product,
  reviewSentimentFn,
}) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    // 👇 FIX: Main container background & border
    <div className="w-full bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl p-6 lg:p-10">
      {/* 👇 FIX: Tab underline border */}
      <div className="flex border-b border-[var(--input-border)] mb-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            // 👇 FIX: Tab text colors
            className={`relative py-3 px-5 text-base md:text-lg font-semibold transition-colors duration-300
              ${activeTab === tab ? "text-primary-500" : "text-[var(--text-muted)] hover:text-[var(--text-main)]"}
            `}
          >
            {tab === "All Reviews" && product.reviews.length > 0 && (
              <span className="absolute top-2 right-1 text-xs bg-primary-600 text-white rounded-full px-2 py-0.5 font-bold">
                {product.reviews.length}
              </span>
            )}
            {tab}
            {activeTab === tab && (
              <motion.div
                className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary-500 rounded-t-sm"
                layoutId="underline"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "All Reviews" && (
              <AllReviewsPanel product={product} reviewSentimentFn={reviewSentimentFn} />
            )}
            {activeTab === "Write Your Review" && (
              <WriteReviewPanel
                userInfo={userInfo}
                loadingProductReview={loadingProductReview}
                submitHandler={submitHandler}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                product={product}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- Sub-component for "All Reviews" Panel ---
const AllReviewsPanel = ({ product, reviewSentimentFn }) => {
  if (product.reviews.length === 0) {
    // 👇 FIX: Empty state text
    return <p className="text-[var(--text-muted)] text-center py-10">Be the first to review this product!</p>;
  }

  return (
    <div className="space-y-6">
      {/* 👇 FIX: Heading text */}
      <h3 className="text-2xl font-bold text-[var(--text-main)] mb-6">Customer Reviews</h3>
      {product.reviews.map((review) => {
        const sentiment = reviewSentimentFn(review.rating);
        return (
          <motion.div 
            key={review._id} 
            // 👇 FIX: Review card background & border
            className="p-5 bg-[var(--bg-grad-2)] rounded-lg border border-[var(--input-border)] shadow-md"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-2 gap-4">
              {/* 👇 FIX: Name text */}
              <h4 className="font-semibold text-lg text-[var(--text-main)]">{review.name}</h4>
              {/* 👇 FIX: Date text */}
              <span className="text-xs text-[var(--text-muted)] flex-shrink-0 pt-1">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <StarRating value={review.rating} />
              <span className={`font-semibold text-sm ${sentiment.color}`}>
                ({sentiment.text})
              </span>
            </div>
            {/* 👇 FIX: Comment text */}
            <p className="text-[var(--text-muted)] leading-relaxed">{review.comment}</p>
          </motion.div>
        );
      })}
    </div>
  );
};

// --- Sub-component for "Write Review" Panel ---
const WriteReviewPanel = ({
  userInfo,
  loadingProductReview,
  submitHandler,
  rating,
  setRating,
  comment,
  setComment,
  product
}) => {
  const [hasPurchased, setHasPurchased] = useState(true); // Placeholder

  if (!userInfo) {
    // 👇 FIX: Text variable
    return <p className="text-[var(--text-muted)] text-center py-10">Please <Link to="/login" className="text-primary-500 underline font-semibold">sign in</Link> to write a review.</p>;
  }

  if (product.reviews.some(r => r.user === userInfo._id)) {
    // 👇 FIX: Text variable
    return <p className="text-[var(--text-muted)] text-center py-10">You have already submitted a review for this product.</p>;
  }
  
  if (!hasPurchased) {
    // 👇 FIX: Text variable
    return <p className="text-[var(--text-muted)] text-center py-10">You must purchase this product to write a review.</p>;
  }

  return (
    <div>
      {/* 👇 FIX: Heading variable */}
      <h3 className="text-2xl font-bold text-[var(--text-main)] mb-6">Write Your Review</h3>
      <form onSubmit={submitHandler} className="space-y-6">
        <div>
          {/* 👇 FIX: Label variable */}
          <label htmlFor="rating" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="rating"
              required
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              // 👇 FIX: Select input variables
              className="w-full p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] appearance-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition"
            >
              <option value="0" disabled>Select Rating...</option>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Very Good</option>
              <option value="3">3 - Good</option>
              <option value="2">2 - Fair</option>
              <option value="1">1 - Poor</option>
            </select>
            {/* 👇 FIX: Icon variable */}
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          {/* 👇 FIX: Label variable */}
          <label htmlFor="comment" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Your Comment <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            rows="5"
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            // 👇 FIX: Textarea variables
            className="w-full p-3 rounded-lg bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition placeholder-[var(--text-muted)]"
            placeholder="Share your thoughts about the product..."
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={loadingProductReview || rating === 0 || !comment.trim()}
          className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-6 rounded-lg text-base font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingProductReview ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

// --- Simple Star Rating Component ---
const StarRating = ({ value }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar 
            key={index} 
            // 👇 FIX: Star color variable
            className={`w-4 h-4 ${starValue <= value ? "text-yellow-400" : "text-[var(--input-border)]"}`}
          />
        );
      })}
    </div>
  );
};

export default ProductTabs;