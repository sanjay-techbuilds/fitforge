// routes/productRoutes.js

import express from "express";
import formidable from "express-formidable";
import asyncHandler from "express-async-handler";
import axios from "axios";
import fs from 'fs';
import FormData from 'form-data';

const router = express.Router();

// Controllers
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  getFilteredProducts, 
  getProductsByDate,
  updateProductColor,
  fetchUniqueBrands,
} from "../controllers/productController.js";

// Middlewares
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";

// Models
import SizeProfile from "../models/sizeProfileModel.js"; 
import Product from "../models/productModel.js";
// No longer need Category model here, .populate() is cleaner

// Utils
import getRecommendedSize from "../utils/getRecommendedSize.js";

// --- General Product Routes (Unchanged) ---
router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, formidable(), addProduct);
router.route("/allproducts").get(fetchAllProducts);
router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);
router.get("/filtered-products", getFilteredProducts);
router.get("/brands", fetchUniqueBrands);
router.get("/by-date/:date", getProductsByDate);
router.route("/:id/reviews").post(authenticate, checkId, addProductReview);
router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, formidable(), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);
router
  .route("/:id/color")
  .put(authenticate, authorizeAdmin, updateProductColor);
  
// --- ML & Recommendation Routes ---

// ========== THIS IS THE FINAL, CORRECT ROUTE ==========
router.get(
  "/:id/recommended-size",
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      // 1. Fetch the product AND its category.
      const product = await Product.findById(req.params.id).populate('category');
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (!product.category) {
        return res.status(404).json({ message: "Product category not found or missing" });
      }

      // 2. Fetch the user profile
      const userProfile = await SizeProfile.findOne({ user: req.user._id });
      if (!userProfile) {
        return res.status(404).json({ message: "Please create your size profile first." });
      }

      // 3. Run the new, simple logic
      const recommendation = getRecommendedSize(userProfile, product);

      if (!recommendation) {
        return res.status(404).json({ message: "Could not recommend a size." });
      }
      
      res.json(recommendation);

    } catch (error) {
      console.error("Error in recommended-size route:", error);
      res.status(500).json({ message: "Server error getting recommendation." });
    }
  })
);
// ========== END OF MODIFIED ROUTE ==========

// --- Other ML Routes (Unchanged) ---
router.get(
  "/recommendations/:productId",
  asyncHandler(async (req, res) => {
    try {
      const { productId } = req.params;
      const mlResponse = await axios.get(
        `http://127.0.0.1:5001/recommend/${productId}`
      );
      res.json(mlResponse.data);
    } catch (error) {
      console.error("Error fetching recommendations from ML server:", error);
      res.status(500).json({ message: "Error fetching recommendations" });
    }
  })
);
router.post(
  "/recommendations/cart",
  asyncHandler(async (req, res) => {
    try {
      const { productIds } = req.body;
      if (!productIds || productIds.length === 0) {
        return res.json([]);
      }
      const mlResponse = await axios.post(
        `http://127.0.0.1:5001/recommend/cart`,
        { productIds: productIds }
      );
      res.json(mlResponse.data);
    } catch (error) {
      console.error("Error fetching cart recommendations:", error);
      res.status(500).json({ message: "Error fetching recommendations" });
    }
  })
);
router.post(
  "/try-on",
  formidable(),
  asyncHandler(async (req, res) => {
    try {
      const userImageFile = req.files.userImage;
      const productId = req.fields.productId;

      const formData = new FormData();
      formData.append('userImage', fs.createReadStream(userImageFile.path), userImageFile.name);
      formData.append('productId', productId);

      const mlResponse = await axios.post(
        "http://127.0.0.1:5001/api/try-on",
        formData,
        { headers: formData.getHeaders() }
      );
      res.json(mlResponse.data);
    
    } catch (error) {
      console.error("Error with virtual try-on:", error);
      res.status(500).json({ message: "Failed to perform try-on" });
    }
  })
);

export default router;