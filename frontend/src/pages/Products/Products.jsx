// Product.jsx
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Rating from "./Rating";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import { addToCart } from "../../redux/features/cart/cartSlice";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import ProductTabs from "./Tabs";
import HeartIcon from "./HeartIcon";

const Product = () => {
  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  // ✅ Size selection handler
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  // ✅ Add to cart with size validation
  const addToCartHandler = () => {
    if (!selectedSize) {
      toast.error("Please select a size before adding to cart");
      return;
    }
    dispatch(addToCart({ ...product, qty, selectedSize }));
    navigate("/cart");
  };

  // ✅ Review submit handler
  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-10">
      <div className="container mx-auto px-6">
        <Link
          className="text-primary-500 font-semibold hover:underline"
          to="/"
        >
          ← Back to Shop
        </Link>

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            {/* ---------------- Product Layout ---------------- */}
            <div className="grid lg:grid-cols-2 gap-12 mt-10">
              {/* ---------------- Product Image ---------------- */}
              <div className="relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="rounded-2xl shadow-lg shadow-pink-500/20 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <HeartIcon product={product} />
                </div>
              </div>

              {/* ---------------- Product Details ---------------- */}
              <div className="flex flex-col justify-between bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-lg">
                <h2 className="text-3xl font-bold text-primary-400">{product.name}</h2>

                <p className="mt-4 text-gray-300">{product.description}</p>

                <p className="text-5xl my-6 font-extrabold text-primary-500">
                  ₹{product.price}
                </p>

                {/* ---------------- Meta Info ---------------- */}
                <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                  <p className="flex items-center gap-2">
                    <FaStore className="text-primary-500" /> Brand: {product.brand}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaClock className="text-primary-500" /> Added:{" "}
                    {moment(product.createdAt).fromNow()}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaStar className="text-primary-500" /> Reviews:{" "}
                    {product.numReviews}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaStar className="text-primary-500" /> Ratings:{" "}
                    {product.rating}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaShoppingCart className="text-primary-500" /> Quantity:{" "}
                    {product.quantity}
                  </p>
                  <p className="flex items-center gap-2">
                    <FaBox className="text-primary-500" /> In Stock:{" "}
                    {product.countInStock}
                  </p>
                </div>

                {/* ---------------- Size Selection ---------------- */}
                <div className="mt-6">
                  <label className="block font-bold text-white mb-2">
                    Size Chart
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["S", "M", "L", "XL", "2XL", "3XL"].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`p-2 rounded-lg border transition-all duration-300 ${
                          selectedSize === size
                            ? "bg-primary-600 border-primary-500 shadow-lg shadow-pink-500/40"
                            : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-green-400 mt-2">
                      ✅ Selected Size: {selectedSize}
                    </p>
                  )}
                </div>

                {/* ---------------- Rating + Quantity ---------------- */}
                <div className="flex items-center justify-between mt-6">
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />

                  {product.countInStock > 0 && (
                    <select
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                      className="p-2 rounded-lg text-black"
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* ---------------- Add to Cart ---------------- */}
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl mt-6 font-semibold transition shadow-lg shadow-pink-500/30 disabled:opacity-50"
                >
                  Add To Cart
                </button>
              </div>
            </div>

            {/* ---------------- Product Tabs ---------------- */}
            <div className="mt-16">
              <ProductTabs
                loadingProductReview={loadingProductReview}
                userInfo={userInfo}
                submitHandler={submitHandler}
                rating={rating}
                setRating={setRating}
                comment={comment}
                setComment={setComment}
                product={product}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Product;
