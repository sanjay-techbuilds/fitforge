import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [cartRecommendations, setCartRecommendations] = useState([]);

  // Memoized calculation for the subtotal (no tax calculation needed here)
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  }, [cartItems]);

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  useEffect(() => {
    const fetchCartRecommendations = async () => {
      const productIds = cartItems.map((item) => item._id);
      if (productIds.length > 0) {
        try {
          const { data } = await axios.post("/api/products/recommendations/cart", { productIds });
          setCartRecommendations(data);
        } catch (error) {
          console.error("Error fetching cart recommendations:", error);
        }
      } else {
        setCartRecommendations([]);
      }
    };
    fetchCartRecommendations();
  }, [cartItems]);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    exit: { x: -50, opacity: 0, transition: { duration: 0.3 } }
  };

  if (cartItems.length === 0) {
    return (
      <motion.div 
        className="container mx-auto mt-20 flex flex-col items-center justify-center text-center p-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 👇 FIX: Muted Text Variable */}
        <FaShoppingCart className="text-7xl text-[var(--text-muted)] mb-4" />
        {/* 👇 FIX: Main Text Variable */}
        <h1 className="text-3xl font-semibold mb-2 text-[var(--text-main)]">Your cart is empty</h1>
        <p className="text-[var(--text-muted)] mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300">
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        {/* 👇 FIX: Main Text Variable */}
        <h1 className="text-3xl font-bold mb-6 text-[var(--text-main)]">Your Shopping Cart</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {cartItems.map((item) => (
              <motion.div
                key={item._id}
                // 👇 FIX: Card Background & Border
                className="flex items-center bg-[var(--card-bg)] border border-[var(--card-border)] p-4 rounded-xl shadow-md"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
              >
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-1 ml-4">
                  <Link to={`/product/${item._id}`} className="text-lg font-semibold text-primary-500 hover:underline">
                    {item.name}
                  </Link>
                  {/* 👇 FIX: Muted Text */}
                  <div className="mt-1 text-sm text-[var(--text-muted)]">{item.brand}</div>
                  {/* 👇 FIX: Main Text */}
                  <div className="mt-2 text-lg font-bold text-[var(--text-main)]">₹{item.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-3">
                  {/* 👇 FIX: Button Backgrounds */}
                  <button onClick={() => addToCartHandler(item, item.qty - 1)} disabled={item.qty === 1} className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] p-2 rounded-full disabled:opacity-50 hover:bg-[var(--bg-grad-3)] transition-colors"><FaMinus size={12} /></button>
                  <span className="w-8 text-center font-semibold text-lg text-[var(--text-main)]">{item.qty}</span>
                  <button onClick={() => addToCartHandler(item, item.qty + 1)} disabled={item.qty >= item.countInStock} className="bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--text-main)] p-2 rounded-full disabled:opacity-50 hover:bg-[var(--bg-grad-3)] transition-colors"><FaPlus size={12} /></button>
                </div>
                <button onClick={() => removeFromCartHandler(item._id)} className="ml-6 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                  <FaTrash size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary - Right Column */}
        <motion.div 
          className="lg:col-span-1 sticky top-24"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* 👇 FIX: Card Background & Border */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg">
            {/* 👇 FIX: Text & Border Colors */}
            <h2 className="text-2xl font-semibold mb-4 border-b border-[var(--input-border)] pb-4 text-[var(--text-main)]">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span className="text-[var(--text-muted)]">Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items)</span>
                <span className="font-semibold text-[var(--text-main)]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-[var(--text-muted)]">Shipping</span>
                <span className="font-semibold text-[var(--text-main)]">Free</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] text-right">Taxes & Shipping calculated at next step</p>
            </div>
            <hr className="my-4 border-[var(--input-border)]" />
            <div className="flex justify-between text-2xl font-bold">
              <span className="text-[var(--text-main)]">Order Total</span>
              <span className="text-primary-500">₹{subtotal.toFixed(2)}</span>
            </div>
            <button
              className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors duration-300 disabled:opacity-50"
              disabled={cartItems.length === 0}
              onClick={checkoutHandler}
            >
              Proceed To Checkout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Cart;