import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import { nanoid } from "nanoid"; // ✨ 1. IMPORT NANOID

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: "rzp_test_fbZuYAFEyrsY5M", // Replace with your Razorpay key
  key_secret: "qeLFj4QOIQrnaQWap3baRreS", // Replace with your Razorpay secret
});

// @desc Create a Razorpay order
// @route POST /api/orders/razorpay
// @access Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { totalPrice } = req.body;

  const options = {
    amount: totalPrice * 100, // Convert to paise
    currency: "INR",
    receipt: `order_rcptid_${Date.now()}`,
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ message: "Failed to create Razorpay order", error: error.message });
  }
});

// @desc Verify Razorpay Payment
// @route POST /api/orders/verify
// @access Private
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const generated_signature = crypto
    .createHmac("sha256", "qeLFj4QOIQrnaQWap3baRreS")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generated_signature === razorpay_signature) {
    const order = await Order.findById(orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: razorpay_payment_id,
        status: "Success",
        update_time: new Date().toISOString(),
      };
      await order.save();
      res.json({ message: "Payment successful", success: true });
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } else {
    res.status(400).json({ message: "Invalid payment signature" });
  }
});

// Utility Function to Calculate Prices
function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxRate = 0.15;
  const taxPrice = (itemsPrice * taxRate).toFixed(2);
  const totalPrice = (itemsPrice + shippingPrice + parseFloat(taxPrice)).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice,
    totalPrice,
  };
}

// @desc Create a new order
// @route POST /api/orders
// @access Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  const itemsFromDB = await Product.find({ _id: { $in: orderItems.map((x) => x._id) } });

  const dbOrderItems = orderItems.map((itemFromClient) => {
    const matchingItemFromDB = itemsFromDB.find(
      (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
    );

    if (!matchingItemFromDB) {
      res.status(404);
      throw new Error(`Product not found: ${itemFromClient._id}`);
    }

    return {
      ...itemFromClient,
      product: itemFromClient._id,
      price: matchingItemFromDB.price,
      _id: undefined,
    };
  });

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems);

  // ✨ 2. GENERATE THE UNIQUE ID
  const uniqueOrderId = nanoid(8).toUpperCase();

  const order = new Order({
    orderId: uniqueOrderId, // ✨ 3. ADD THE ID TO THE ORDER OBJECT
    orderItems: dbOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).populate("user", "id username name");
  res.json(orders);
});

const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

const countTotalOrders = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  res.json({ totalOrders });
});

const calculateTotalSales = asyncHandler(async (req, res) => {
  const orders = await Order.find({ isPaid: true });
  const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  res.json({ totalSales });
});

const calcualteTotalSalesByDate = asyncHandler(async (req, res) => {
  const salesByDate = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
  res.json(salesByDate);
});

const findOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "username email name");
  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const markOrderAsPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };
    const updateOrder = await order.save();
    res.status(200).json(updateOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

const markOrderAsDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  createRazorpayOrder,
  verifyPayment,
};