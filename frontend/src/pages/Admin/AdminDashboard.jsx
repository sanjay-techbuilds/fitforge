import React, { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { motion } from "framer-motion";
import { useGetUsersQuery } from "../../redux/api/usersApiSlice";
import {
  useGetTotalOrdersQuery,
  useGetTotalSalesByDateQuery,
  useGetTotalSalesQuery,
  useGetOrdersQuery,
} from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { FaDollarSign, FaUsers, FaBoxOpen } from "react-icons/fa";
import { FiRefreshCw, FiSearch } from "react-icons/fi";

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="text-right">
      {/* 👇 FIX: Dynamic Text Colors */}
      <p className="text-3xl font-semibold text-[var(--text-main)]">{formatTime(time)}</p>
      <p className="text-sm text-[var(--text-muted)]">{formatDate(time)}</p>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => (
  // 👇 FIX: Dynamic Card Background & Border
  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl flex items-center gap-6 shadow-lg transition-transform hover:scale-105 hover:shadow-pink-500/20">
    <div className="bg-primary-500/10 text-primary-500 p-4 rounded-full">{icon}</div>
    <div>
      <p className="text-[var(--text-muted)] text-sm font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-[var(--text-main)]">{value}</h2>
    </div>
  </div>
);

const SkeletonCard = () => (
  // 👇 FIX: Dynamic Skeleton Background
  <div className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl flex items-center gap-6 shadow-lg animate-pulse">
    <div className="bg-[var(--bg-grad-3)] p-4 rounded-full w-14 h-14"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-[var(--bg-grad-3)] rounded w-3/4"></div>
      <div className="h-6 bg-[var(--bg-grad-3)] rounded w-1/2"></div>
    </div>
  </div>
);

const OrderStatusChart = () => {
  const { data: orders, isLoading } = useGetOrdersQuery();

  const statusCounts = orders?.reduce(
    (acc, order) => {
      if (order.isDelivered) {
        acc.completed += 1;
      } else if (order.isPaid) {
        acc.pending += 1;
      } else {
        acc.placed += 1;
      }
      return acc;
    },
    { completed: 0, pending: 0, placed: 0 }
  );

  const chartOptions = {
    chart: { foreColor: "#9CA3AF" },
    colors: ["#10B981", "#F59E0B", "#3B82F6"],
    labels: ["Completed", "Pending", "Order Placed"],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    tooltip: { theme: "dark" },
    stroke: { width: 0 },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 250,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <FiRefreshCw className="animate-spin text-2xl text-[var(--text-muted)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <Chart
        options={chartOptions}
        series={[
          statusCounts?.completed || 0,
          statusCounts?.pending || 0,
          statusCounts?.placed || 0,
        ]}
        type="donut"
        width="380"
      />
    </div>
  );
};

const AdminDashboard = () => {
  const { data: sales, isLoading: salesLoading } = useGetTotalSalesQuery();
  const { data: customers, isLoading: customersLoading } = useGetUsersQuery();
  const { data: totalOrders, isLoading: ordersLoading } = useGetTotalOrdersQuery();
  const { data: salesDetail, isLoading: salesDetailLoading } = useGetTotalSalesByDateQuery();
  const { data: allOrders, isLoading: allOrdersLoading } = useGetOrdersQuery();
  const [searchTerm, setSearchTerm] = useState("");

  const [chartState, setChartState] = useState({
    options: {
      chart: {
        type: "area",
        foreColor: "#9CA3AF",
        toolbar: { show: false },
      },
      tooltip: { theme: "dark" },
      colors: ["#F43F5E"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: "#374151",
        show: true,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
      },
      markers: { size: 0 },
      xaxis: {
        categories: [],
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        title: { text: "Sales (₹)" },
        labels: {
          formatter: (value) => `₹${value.toFixed(0)}`,
        },
      },
      legend: { show: false },
    },
    series: [{ name: "Sales", data: [] }],
  });

  useEffect(() => {
    if (salesDetail) {
      const formattedSalesDate = salesDetail.map((item) => ({
        x: new Date(item._id).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        y: item.totalSales || 0,
      }));

      setChartState((prevState) => ({
        ...prevState,
        options: {
          ...prevState.options,
          xaxis: { categories: formattedSalesDate.map((item) => item.x) },
        },
        series: [{ name: "Sales", data: formattedSalesDate.map((item) => item.y) }],
      }));
    }
  }, [salesDetail]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const filteredOrders =
    allOrders?.filter((order) => {
      const term = searchTerm.toLowerCase();
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-CA");
      const idToSearch = order.orderId ? order.orderId.toLowerCase() : order._id.toLowerCase();

      return (
        idToSearch.includes(term) ||
        (order.user?.username ?? '').toLowerCase().includes(term) ||
        orderDate.includes(term)
      );
    }) || [];

  return (
    // 👇 FIX: Page Background
    <div className="flex min-h-screen bg-[var(--bg-grad-1)] text-[var(--text-main)]">
      <AdminMenu />
      <main className="flex-1 p-6 lg:p-10">
        <motion.div
          className="max-w-7xl mx-auto space-y-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="flex flex-col md:flex-row justify-between items-start gap-6"
            variants={itemVariants}
          >
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-[var(--text-muted)] mt-1">
                Welcome back, Admin! Here's your business snapshot.
              </p>
            </div>
            <LiveClock />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {salesLoading || customersLoading || ordersLoading ? (
              [...Array(3)].map((_, i) => (
                <motion.div key={i} variants={itemVariants}>
                  <SkeletonCard />
                </motion.div>
              ))
            ) : (
              <>
                <motion.div variants={itemVariants}>
                  <StatCard
                    icon={<FaDollarSign size={24} />}
                    title="Total Sales"
                    value={`₹ ${sales?.totalSales?.toFixed(2) || "0.00"}`}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    icon={<FaUsers size={24} />}
                    title="Total Customers"
                    value={customers?.length || 0}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <StatCard
                    icon={<FaBoxOpen size={24} />}
                    title="Total Orders"
                    value={totalOrders?.totalOrders || 0}
                  />
                </motion.div>
              </>
            )}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
            variants={containerVariants}
          >
            <motion.div
              // 👇 FIX: Chart Container Background
              className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg lg:col-span-3"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
              {salesDetailLoading ? (
                <div className="flex justify-center items-center h-[350px]">
                  <Loader />
                </div>
              ) : (
                <Chart
                  options={chartState.options}
                  series={chartState.series}
                  type="area"
                  height={350}
                />
              )}
            </motion.div>
            <motion.div
              // 👇 FIX: Chart Container Background
              className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg lg:col-span-2"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold mb-4">Order Status</h2>
              <div className="h-[350px]">
                <OrderStatusChart />
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            // 👇 FIX: Table Container Background
            className="bg-[var(--card-bg)] border border-[var(--card-border)] p-6 rounded-2xl shadow-lg"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="Search by ID, user, or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // 👇 FIX: Search Input Background & Text
                  className="w-full bg-[var(--input-bg)] text-[var(--text-main)] border border-[var(--input-border)] placeholder-[var(--text-muted)] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              {allOrdersLoading ? (
                <Loader />
              ) : (
                <table className="min-w-full divide-y divide-[var(--input-border)]">
                  {/* 👇 FIX: Table Header Background */}
                  <thead className="bg-[var(--bg-grad-2)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Delivery</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  {/* 👇 FIX: Table Body Background */}
                  <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--input-border)]">
                    {filteredOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-[var(--bg-grad-3)] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={order.orderItems[0].image}
                            alt={order.orderItems[0].name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                          {order.orderId || order._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-main)]">
                          {order.user ? order.user.username : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                          ₹{order.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.isPaid ? (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {order.isDelivered ? (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-400">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link to={`/order/${order._id}`} className="text-primary-500 hover:text-primary-400">
                            More
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;