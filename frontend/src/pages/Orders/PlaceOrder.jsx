import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import CheckoutSteps from "../../components/CheckoutSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";
import axios from "axios";
import { FaMapMarkerAlt, FaCreditCard } from "react-icons/fa";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();

      // Initiate Razorpay Payment
      const { data: razorpayData } = await axios.post("/api/orders/razorpay", { totalPrice: cart.totalPrice });

      const options = {
        key: "rzp_test_fbZuYAFEyrsY5M", // Your Razorpay Key ID
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        order_id: razorpayData.orderId,
        name: "FitForge",
        description: "Thank you for your purchase",
        handler: async (response) => {
          try {
            await axios.post("/api/orders/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: res._id,
            });
            dispatch(clearCartItems());
            navigate(`/order/${res._id}`);
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: userInfo.username,
          email: userInfo.email,
        },
        theme: { color: "#ec4899" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      toast.error(err?.data?.message || err.error || "Failed to place order.");
    }
  };

  return (
    <div className="container mx-auto mt-10 p-4">
      <CheckoutSteps step1 step2 step3 />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Left Column: Items and Shipping */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <motion.div 
            // 👇 FIX: Theme-aware card background
            className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg" 
            initial={{opacity: 0, x: -50}} 
            animate={{opacity: 1, x: 0}}
          >
            <h2 className="text-2xl font-semibold mb-4 text-[var(--heading-col)]">Order Items</h2>
            <div className="space-y-4">
              {cart.cartItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center border-b border-[var(--input-border)] pb-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-[var(--input-border)]" />
                    <div>
                      <Link to={`/product/${item._id}`} className="font-semibold hover:underline text-[var(--text-main)]">{item.name}</Link>
                      <p className="text-sm text-[var(--text-muted)]">{item.qty} x ₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg text-[var(--text-main)]">₹{(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Shipping & Payment Details */}
          <motion.div 
            // 👇 FIX: Theme-aware card background
            className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg" 
            initial={{opacity: 0, x: -50}} 
            animate={{opacity: 1, x: 0}} 
            transition={{delay: 0.1}}
          >
             <h2 className="text-2xl font-semibold mb-4 text-[var(--heading-col)]">Shipping & Payment</h2>
             <div className="flex items-start gap-4 mb-4">
                <FaMapMarkerAlt className="text-2xl text-primary-500 mt-1"/>
                <div>
                    <h3 className="font-semibold text-[var(--text-main)]">Shipping Address</h3>
                    <p className="text-[var(--text-muted)]">{cart.shippingAddress.address}, {cart.shippingAddress.city}, {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <FaCreditCard className="text-2xl text-primary-500 mt-1"/>
                <div>
                    <h3 className="font-semibold text-[var(--text-main)]">Payment Method</h3>
                    <p className="text-[var(--text-muted)]">{cart.paymentMethod}</p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* Right Column: Final Summary & Pay Button */}
        <motion.div className="lg:col-span-1" initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}}>
          {/* 👇 FIX: Theme-aware card background */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg sticky top-24">
            <h2 className="text-2xl font-semibold mb-4 border-b border-[var(--input-border)] pb-4 text-[var(--heading-col)]">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Items</span><span className="font-semibold text-[var(--text-main)]">₹{cart.itemsPrice}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Shipping</span><span className="font-semibold text-[var(--text-main)]">₹{cart.shippingPrice}</span></div>
              <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tax (GST)</span><span className="font-semibold text-[var(--text-main)]">₹{cart.taxPrice}</span></div>
              <hr className="my-2 border-[var(--input-border)]" />
              <div className="flex justify-between text-xl font-bold"><span className="text-[var(--heading-col)]" >Total</span><span className="text-primary-500">₹{cart.totalPrice}</span></div>
            </div>

            {error && <div className="my-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-lg">{error?.data?.message || error.error}</div>}

            <button
              type="button"
              className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors disabled:opacity-50"
              disabled={cart.cartItems.length === 0 || isLoading}
              onClick={placeOrderHandler}
            >
              {isLoading ? <Loader size="sm"/> : "Proceed to Pay"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlaceOrder;