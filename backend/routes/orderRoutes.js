import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
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
} from "../controllers/orderController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Razorpay Credentials
const razorpay = new Razorpay({
  key_id: "rzp_test_fbZuYAFEyrsY5M", // Replace with your Razorpay key
  key_secret: "qeLFj4QOIQrnaQWap3baRreS", // Replace with your Razorpay secret
});

// Create Razorpay Order
router.post("/razorpay", authenticate, createRazorpayOrder);

// Verify Razorpay Payment
router.post("/verify", authenticate, verifyPayment);

// Existing Order Routes
router.route("/").post(authenticate, createOrder).get(authenticate, authorizeAdmin, getAllOrders);
router.route("/mine").get(authenticate, getUserOrders);
router.route("/total-orders").get(countTotalOrders);
router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calcualteTotalSalesByDate);
router.route("/:id").get(authenticate, findOrderById);
router.route("/:id/pay").put(authenticate, markOrderAsPaid);
router.route("/:id/deliver").put(authenticate, authorizeAdmin, markOrderAsDelivered);

export default router;