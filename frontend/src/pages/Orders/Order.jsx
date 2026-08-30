import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { useGetOrderDetailsQuery, useDeliverOrderMutation } from "../../redux/api/orderApiSlice";
import { FaBox, FaCheckCircle, FaClipboardCheck, FaCreditCard, FaMapMarkerAlt, FaShippingFast, FaUser } from "react-icons/fa";

// ✨ NEW: Order Status Tracker Component
const StatusTracker = ({ isPaid, isDelivered }) => {
  const steps = [
    { name: "Order Placed", completed: true },
    { name: "Payment Confirmed", completed: isPaid },
    { name: "Shipped", completed: isDelivered },
    { name: "Delivered", completed: isDelivered },
  ];
  
  return (
    <div className="flex items-center justify-between my-8 px-4">
      {steps.map((step, index) => (
        <div key={step.name} className="flex flex-col items-center flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
            {step.completed ? <FaCheckCircle /> : <div className="w-3 h-3 bg-gray-500 rounded-full"></div>}
          </div>
          <p className={`mt-2 text-xs text-center ${step.completed ? 'text-white' : 'text-gray-400'}`}>{step.name}</p>
          {index < steps.length - 1 && <div className={`absolute top-5 left-1/2 w-full h-0.5 ${steps[index + 1].completed ? 'bg-green-500' : 'bg-gray-700'}`}></div>}
        </div>
      ))}
    </div>
  );
};


const Order = () => {
  const { id: orderId } = useParams();
  const { data: order, refetch, isLoading, error } = useGetOrderDetailsQuery(orderId);
  const [deliverOrder, { isLoading: loadingDeliver }] = useDeliverOrderMutation();
  const { userInfo } = useSelector((state) => state.auth);

  const deliverHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success("Order marked as delivered");
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader /></div>;
  if (error) return <div className="container mx-auto mt-10"><Message variant="danger">{error?.data?.message || error.error}</Message></div>;

  return (
    <div className="container mx-auto mt-10 p-4">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Order Details</h1>
        <p className="text-gray-400">Order ID: <span className="font-mono text-primary-400">{order.orderId || order._id}</span></p>
      </motion.div>
      
      <div className="bg-[#1F1F1F] p-6 rounded-2xl shadow-lg my-6">
        <StatusTracker isPaid={order.isPaid} isDelivered={order.isDelivered} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <motion.div className="bg-[#1F1F1F] p-6 rounded-2xl shadow-lg" initial={{opacity: 0, x: -50}} animate={{opacity: 1, x: 0}} transition={{delay: 0.1}}>
            <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-3"><FaBox /> Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <Link to={`/product/${item.product}`} className="font-semibold hover:underline">{item.name}</Link>
                      <p className="text-sm text-gray-400">{item.qty} x ₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">₹{(item.qty * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Shipping & Payment */}
          <motion.div className="bg-[#1F1F1F] p-6 rounded-2xl shadow-lg" initial={{opacity: 0, x: -50}} animate={{opacity: 1, x: 0}} transition={{delay: 0.2}}>
            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="text-2xl text-primary-400 mt-1"/>
              <div>
                  <h3 className="font-semibold">Shipping to {order.user.username}</h3>
                  <p className="text-gray-300">{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
                  {order.isDelivered ? <div className="mt-2 text-green-400 text-sm font-semibold">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</div> : <div className="mt-2 text-yellow-400 text-sm font-semibold">Not Delivered</div>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Summary */}
        <motion.div className="lg:col-span-1" initial={{opacity: 0, x: 50}} animate={{opacity: 1, x: 0}} transition={{delay: 0.3}}>
          <div className="bg-[#1F1F1F] p-6 rounded-2xl shadow-lg sticky top-24">
            <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-300">Items</span><span className="font-semibold">₹{order.itemsPrice}</span></div>
              <div className="flex justify-between"><span className="text-gray-300">Shipping</span><span className="font-semibold">₹{order.shippingPrice}</span></div>
              <div className="flex justify-between"><span className="text-gray-300">Tax (GST)</span><span className="font-semibold">₹{order.taxPrice}</span></div>
              <hr className="my-2 border-gray-700" />
              <div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-primary-500">₹{order.totalPrice}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-start gap-3">
                <FaCreditCard className="text-lg text-gray-400 mt-1"/>
                <div>
                  <h3 className="font-semibold text-sm">Payment Method</h3>
                  <p className="text-gray-300 text-sm">{order.paymentMethod}</p>
                  {order.isPaid ? <div className="mt-1 text-green-400 text-xs font-semibold">Paid on {new Date(order.paidAt).toLocaleDateString()}</div> : <div className="mt-1 text-red-400 text-xs font-semibold">Not Paid</div>}
                </div>
              </div>
            </div>
            
            {userInfo && userInfo.isAdmin && order.isPaid && !order.isDelivered && (
              <button type="button" onClick={deliverHandler} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full text-lg transition-colors">
                {loadingDeliver ? <Loader size="sm"/> : "Mark as Delivered"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Order;
