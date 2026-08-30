import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";

const OrderList = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    // 👇 FIX: Main Layout Container using theme variables
    <div className="flex min-h-screen bg-[var(--bg-grad-1)] text-[var(--text-main)]">
      
      {/* 👇 FIX: AdminMenu is now a sidebar */}
      <AdminMenu />

      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-[var(--heading-col)]">Manage Orders</h1>

          {isLoading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">
              {error?.data?.message || error.error}
            </Message>
          ) : (
            // 👇 FIX: Table Container with card styling
            <div className="overflow-x-auto bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-lg">
              <table className="w-full text-left border-collapse">
                {/* 👇 FIX: Table Header using secondary background variable */}
                <thead className="bg-[var(--bg-grad-2)] border-b border-[var(--card-border)]">
                  <tr>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Item</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">ID</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Total</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Paid</th>
                    <th className="p-4 text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Delivered</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[var(--input-border)]">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-[var(--bg-grad-3)] transition-colors">
                      
                      {/* Image */}
                      <td className="p-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-[var(--input-border)]">
                          <img
                            src={order.orderItems[0].image}
                            alt={order._id}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      {/* ID */}
                      <td className="p-4 text-sm font-mono text-[var(--text-muted)]">
                        {order._id.substring(0, 10)}...
                      </td>

                      {/* User */}
                      <td className="p-4 font-medium">
                        {order.user ? order.user.username : "N/A"}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-sm text-[var(--text-muted)]">
                        {order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}
                      </td>

                      {/* Total */}
                      <td className="p-4 font-bold text-[var(--text-main)]">
                        ₹ {order.totalPrice}
                      </td>

                      {/* Paid Status */}
                      <td className="p-4">
                        {order.isPaid ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Delivery Status */}
                      <td className="p-4">
                        {order.isDelivered ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800">
                            Delivered
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800">
                            Processing
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="p-4">
                        <Link to={`/order/${order._id}`}>
                          <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg shadow-md transition-all">
                            Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderList;