import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { saveShippingAddress, savePaymentMethod } from "../../redux/features/cart/cartSlice";
import CheckoutSteps from "../../components/CheckoutSteps";
import { FaCreditCard, FaPaypal } from "react-icons/fa";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, cartItems } = cart;

  // Set default payment method to "Razorpay"
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  const [address, setAddress] = useState(shippingAddress.address || "");
  const [city, setCity] = useState(shippingAddress.city || "");
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || "");
  const [country, setCountry] = useState(shippingAddress.country || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    dispatch(savePaymentMethod(paymentMethod));
    navigate("/placeorder");
  };

  // Reusable styles using CSS Variables
  const inputStyles = "w-full bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelStyles = "block text-sm font-medium text-[var(--text-muted)] mb-1";

  return (
    <div className="container mx-auto mt-10 p-4">
      <CheckoutSteps step1 step2 />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Left Column: Shipping & Payment Forms */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 👇 FIX: Card background and border */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-[var(--heading-col)]">Shipping Information</h2>
            <form id="shipping-form" onSubmit={submitHandler}>
              <div className="space-y-4">
                <div>
                  <label className={labelStyles}>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className={inputStyles} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelStyles}>City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className={inputStyles} />
                  </div>
                  <div>
                    <label className={labelStyles}>Postal Code</label>
                    <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className={inputStyles} />
                  </div>
                </div>
                <div>
                  <label className={labelStyles}>Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required className={inputStyles} />
                </div>
              </div>

              <h2 className="text-2xl font-semibold mt-8 mb-4 text-[var(--heading-col)]">Payment Method</h2>
              <div className="space-y-3">
                <label className={`flex items-center p-4 rounded-lg cursor-pointer transition-all border-2 
                  ${paymentMethod === 'Razorpay' 
                    ? 'bg-primary-600/20 border-primary-500' 
                    : 'bg-[var(--input-bg)] border-[var(--input-border)] hover:bg-[var(--bg-grad-3)]'
                  }`}
                >
                  <input type="radio" name="paymentMethod" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <FaCreditCard className="text-2xl text-primary-500 mr-4 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-[var(--text-main)]">Pay with Razorpay</h3>
                    <p className="text-xs text-[var(--text-muted)]">Securely pay with UPI, Cards, Netbanking.</p>
                  </div>
                </label>
                {/* Add other payment methods here if needed */}
              </div>
            </form>
          </div>
        </motion.div>

        {/* Right Column: Order Summary */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 👇 FIX: Card background and border */}
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg sticky top-24">
            <h2 className="text-2xl font-semibold mb-4 border-b border-[var(--input-border)] pb-4 text-[var(--heading-col)]">Order Summary</h2>
            <div className="space-y-3">
              {cartItems.map(item => (
                <div key={item._id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover border border-[var(--input-border)]"/>
                    <div>
                      {/* 👇 FIX: Text colors */}
                      <p className="text-[var(--text-main)]">{item.name} <span className="text-[var(--text-muted)]">x{item.qty}</span></p>
                      <p className="text-xs text-[var(--text-muted)]">{item.brand}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-[var(--text-main)]">₹{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr className="my-4 border-[var(--input-border)]" />
            <div className="space-y-2">
                {/* 👇 FIX: Text colors */}
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Subtotal</span><span className="font-semibold text-[var(--text-main)]">₹{cart.itemsPrice}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Shipping</span><span className="font-semibold text-[var(--text-main)]">₹{cart.shippingPrice}</span></div>
                <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tax (GST)</span><span className="font-semibold text-[var(--text-main)]">₹{cart.taxPrice}</span></div>
                <hr className="my-2 border-[var(--input-border)]" />
                <div className="flex justify-between text-xl font-bold"><span className="text-[var(--heading-col)]">Total</span><span className="text-primary-500">₹{cart.totalPrice}</span></div>
            </div>
            <button
              type="submit"
              form="shipping-form"
              className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-full text-lg transition-colors"
            >
              Continue to Summary
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Shipping;