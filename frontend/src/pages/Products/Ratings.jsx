// src/pages/Products/Ratings.jsx

import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

// Set default values for props and fix Tailwind color bug
const Ratings = ({ value = 0, text = "" }) => {
  const fullStars = Math.floor(value);
  const halfStars = value - fullStars > 0.5 ? 1 : 0;
  const emptyStar = 5 - fullStars - halfStars;

  return (
    <div className="flex items-center">
      {/* Hardcode the Tailwind class 'text-yellow-400' to fix the bug */}
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={index} className="text-yellow-400" />
      ))}

      {halfStars === 1 && <FaStarHalfAlt className="text-yellow-400" />}
      
      {[...Array(emptyStar)].map((_, index) => (
        <FaRegStar key={index} className="text-gray-500" />
      ))}

      {/* Make sure 'text' is optional and style it */}
      {text && (
        <span className="text-sm text-gray-400 ml-2">
          {text}
        </span>
      )}
    </div>
  );
};

export default Ratings;