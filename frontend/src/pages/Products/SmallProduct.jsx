import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import { FaShoppingCart } from "react-icons/fa";

const SmallProduct = ({ product }) => {
  return (
    <div className="w-full max-w-[220px] mx-auto bg-white shadow-lg hover:shadow-2xl rounded-2xl overflow-hidden relative group transition-all duration-300">
      {/* Product Image */}
      <div className="relative">
        <img
        src={product.image}
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer" //  <-- Add this line for robustness
        />
        <div className="absolute top-3 right-3 z-10">
          <HeartIcon product={product} />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
          <Link
            to={`/product/${product._id}`}
            className="bg-primary-600 text-white px-5 py-2 rounded-full flex items-center gap-2 font-semibold hover:bg-primary-700 transition"
          >
            <FaShoppingCart /> View Product
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 text-center">
        <Link to={`/product/${product._id}`}>
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-primary-600 transition line-clamp-1">
            {product.name}
          </h2>
        </Link>

        <p className="mt-2 text-xl font-bold text-primary-600">₹{product.price}</p>

        {product.countInStock > 0 ? (
          <p className="text-green-600 text-sm mt-1">In Stock</p>
        ) : (
          <p className="text-red-600 text-sm mt-1">Out of Stock</p>
        )}

        {/* Category Link */}
        {product.categoryName && product.category && (
          <Link
            to={`/category/${product.categoryName.toLowerCase()}?id=${product.category}`}
            className="mt-2 inline-block text-primary-500 font-semibold hover:underline text-sm"
          >
            View more in {product.categoryName}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SmallProduct;
