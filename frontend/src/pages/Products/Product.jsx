import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { motion } from "framer-motion";
import HeartIcon from "./HeartIcon";

// ✨ 1. Accept `handleAddToCart` as a prop
const Product = ({ product, badgeText, isLarge = false, handleAddToCart }) => {
  return (
    <motion.div
      className="relative bg-[var(--card-bg)] border border-[var(--card-border)]/50 rounded-2xl shadow-lg overflow-hidden group border border-slate-700/50 flex flex-col h-full"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {badgeText && (
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          {badgeText}
        </div>
      )}
      
      <div className="absolute top-4 right-4 z-10">
        <HeartIcon product={product} />
      </div>

      <Link to={`/product/${product._id}`} className="flex flex-col flex-grow">
        <div className="w-full aspect-square overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:opacity-80 transition-all duration-300 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <h4 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-semibold text-white mb-2 truncate`}>
            {product.name}
          </h4>
          <div className="flex justify-between items-center mt-auto">
            <span className={`${isLarge ? 'text-3xl' : 'text-xl'} font-bold text-primary-400`}>
              ₹{product.price}
            </span>
            <button
              className="p-2 rounded-full bg-primary-500 text-white shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-opacity-75 transition-transform transform hover:scale-110"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // ✨ 2. Call the new prop function
                handleAddToCart(product, 1);
              }}
            >
              <AiOutlineShoppingCart size={22} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default Product;
