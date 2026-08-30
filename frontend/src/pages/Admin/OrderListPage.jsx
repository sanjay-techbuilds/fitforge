import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGetOrdersQuery } from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileInvoiceDollar,
  FaBoxOpen,
  FaTruck,
  FaExclamationCircle,
} from "react-icons/fa";

// ✨ Reusable KPI Card Component (Fixed Theme)
const KpiCard = ({ icon, title, value, colorClass }) => (
  <motion.div
    className="bg-[var(--card-bg)] border border-[var(--card-border)] p-5 rounded-xl flex items-center gap-4 shadow-lg"
    whileHover={{ scale: 1.05 }}
  >
    <div className={`p-3 rounded-full ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-[var(--text-muted)] text-sm font-medium">{title}</p>
      <h3 className="text-xl font-bold text-[var(--text-main)]">{value}</h3>
    </div>
  </motion.div>
);

// ✨ Reusable Filter Dropdown (Fixed Theme)
const FilterDropdown = ({ options, value, onChange, label }) => (
  <div>
    <label className="text-sm text-[var(--text-muted)] mr-2">{label}:</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--input-border)] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  </div>
);


const OrderListPage = () => {
  const { data: allOrders, isLoading } = useGetOrdersQuery();

  // State for filters, sorting, and pagination
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // ✨ Memoized calculations for performance
  const filteredOrders = useMemo(() => {
    if (!allOrders) return [];
    
    let filtered = [...allOrders];

    // Apply payment status filter
    if (paymentFilter !== "all") {
      const isPaid = paymentFilter === "paid";
      filtered = filtered.filter(order => order.isPaid === isPaid);
    }
    
    // Apply delivery status filter
    if (deliveryFilter !== "all") {
      const isDelivered = deliveryFilter === "delivered";
      filtered = filtered.filter(order => order.isDelivered === isDelivered);
    }
    
    return filtered;
  }, [allOrders, paymentFilter, deliveryFilter]);
  
  const sortedAndFilteredOrders = useMemo(() => {
    let sortableOrders = [...filteredOrders];
    if (sortConfig.key) {
      sortableOrders.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [filteredOrders, sortConfig]);

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedAndFilteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedAndFilteredOrders.length / ordersPerPage);

  // KPI Calculations
  const kpiData = useMemo(() => {
    if (!allOrders) return { revenue: 0, total: 0, pending: 0, unpaid: 0 };
    return {
      revenue: allOrders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0),
      total: allOrders.length,
      pending: allOrders.filter(o => !o.isDelivered).length,
      unpaid: allOrders.filter(o => !o.isPaid).length,
    }
  }, [allOrders]);
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="inline ml-1 opacity-30" />;
    if (sortConfig.direction === 'asc') return <FaSortUp className="inline ml-1 text-primary-500" />;
    return <FaSortDown className="inline ml-1 text-primary-500" />;
  };

  return (
    // 👇 FIX: Removed text-[var(--text-main)] to prevent override
    <div className="flex min-h-screen bg-[var(--bg-grad-1)]">
      <AdminMenu />
      <main className="flex-1 p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold mb-2 text-[var(--heading-col)]">Order Management</h1>
            <p className="text-[var(--text-muted)] mb-8">View, filter, and manage all customer orders.</p>
          </motion.div>

          {/* KPI Section */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          >
            {/* 👇 FIXED: Added !important (!) to light mode text colors */}
            <KpiCard icon={<FaFileInvoiceDollar size={22}/>} title="Total Revenue" value={`₹${kpiData.revenue.toFixed(2)}`} colorClass="bg-emerald-100 !text-emerald-600 dark:bg-emerald-900/30 dark:!text-emerald-400" />
            <KpiCard icon={<FaBoxOpen size={22}/>} title="Total Orders" value={kpiData.total} colorClass="bg-blue-100 !text-blue-600 dark:bg-blue-900/30 dark:!text-blue-400" />
            <KpiCard icon={<FaTruck size={22}/>} title="Pending Deliveries" value={kpiData.pending} colorClass="bg-amber-100 !text-amber-600 dark:bg-amber-900/30 dark:!text-amber-400" />
            <KpiCard icon={<FaExclamationCircle size={22}/>} title="Unpaid Orders" value={kpiData.unpaid} colorClass="bg-rose-100 !text-rose-600 dark:bg-rose-900/30 dark:!text-rose-400" />
          </motion.div>

          {/* Filters and Table Section */}
          <motion.div 
            className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-[var(--heading-col)]">All Orders</h2>
              <div className="flex items-center gap-4">
                <FilterDropdown label="Payment" value={paymentFilter} onChange={setPaymentFilter} options={[{value: 'all', label: 'All'}, {value: 'paid', label: 'Paid'}, {value: 'pending', label: 'Pending'}]} />
                <FilterDropdown label="Delivery" value={deliveryFilter} onChange={setDeliveryFilter} options={[{value: 'all', label: 'All'}, {value: 'delivered', label: 'Delivered'}, {value: 'pending', label: 'Pending'}]} />
              </div>
            </div>

            {isLoading ? <div className="text-center py-10"><Loader /></div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--input-border)]">
                  <thead className="bg-[var(--bg-grad-2)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>Date {getSortIcon('createdAt')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalPrice')}>Total {getSortIcon('totalPrice')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--input-border)] bg-[var(--card-bg)]">
                    {currentOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-[var(--bg-grad-3)] transition-colors duration-200">
                        <td className="px-6 py-4">
                           <div className="w-10 h-10 rounded-md overflow-hidden border border-[var(--input-border)]">
                              <img src={order.orderItems[0].image} alt={order.orderItems[0].name} className="w-full h-full object-cover" />
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)] font-mono">{order.orderId || order._id.substring(0, 10)}...</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-main)] font-medium">{order.user ? order.user.username : "N/A"}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm text-[var(--text-main)] font-bold">₹{order.totalPrice.toFixed(2)}</td>
                        
                        {/* 👇 FIXED: Added !important (!) to light mode text colors */}
                        <td className="px-6 py-4">
                          {order.isPaid ? 
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 !text-emerald-800 dark:bg-emerald-900/40 dark:!text-emerald-400">Paid</span> : 
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-100 !text-rose-800 dark:bg-rose-900/40 dark:!text-rose-400">Pending</span>}
                        </td>
                        <td className="px-6 py-4">
                          {order.isDelivered ? 
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 !text-emerald-800 dark:bg-emerald-900/40 dark:!text-emerald-400">Delivered</span> : 
                            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 !text-amber-800 dark:bg-amber-900/40 dark:!text-amber-400">Pending</span>}
                        </td>
                        
                        <td className="px-6 py-4 text-sm font-medium text-right"><Link to={`/order/${order._id}`} className="text-primary-500 hover:text-primary-600 hover:underline">More</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-[var(--text-muted)]">
                    Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, sortedAndFilteredOrders.length)} of {sortedAndFilteredOrders.length} orders
                </span>
                <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-3 py-1 bg-[var(--input-bg)] text-[var(--text-main)] border border-[var(--input-border)] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-grad-3)]">Prev</button>
                    <span className="text-sm text-[var(--text-muted)]">Page {currentPage} of {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-3 py-1 bg-[var(--input-bg)] text-[var(--text-main)] border border-[var(--input-border)] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-grad-3)]">Next</button>
                </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default OrderListPage;