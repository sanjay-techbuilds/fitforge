import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import mongoose from "mongoose";
import Sentiment from "sentiment";
import axios from "axios";
import FormData from "form-data";
import fileUpload from 'express-fileupload';

const sentiment = new Sentiment();

// Helper function to check valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ... (keep all your other functions like getProductsByDate, getProductById, addProduct, etc. They are unchanged)

export const getProductsByDate = asyncHandler(async (req, res) => {
  try {
    const { date } = req.params;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    const products = await Product.find({
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`),
        $lt: new Date(`${date}T23:59:59.999Z`),
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid product ID format" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand } = req.fields;

    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    const product = new Product({ ...req.fields });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand } = req.fields;

    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.fields },
      { new: true }
    );

    await product.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { brand: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const products = await Product.find({ ...keyword });

    res.json({
      products,
      page: 1,
      pages: 1,
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed" });
    }

    const sentimentResult = new Sentiment().analyze(comment);
    let sentimentLabel = "neutral";
    if (sentimentResult.score > 0) sentimentLabel = "positive";
    else if (sentimentResult.score < 0) sentimentLabel = "negative";

    const review = {
      name: req.user.username,
      rating: Number(rating),
      comment,
      user: req.user._id,
      sentiment: sentimentLabel,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      message: "Review added",
      sentiment: sentimentLabel,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

// ✨ REPLACED: This is the updated filter function with smarter search logic.
export const getFilteredProducts = asyncHandler(async (req, res) => {
  try {
    const { categories, brands, minPrice, maxPrice, sortBy, keyword } = req.query;
    
    const query = {};

    if (categories) {
      const categoryList = categories.split(',');
      if (categoryList.length > 0 && categoryList[0] !== '') {
        query.category = { $in: categoryList };
      }
    }

    if (brands) {
      const brandList = brands.split(',');
      if (brandList.length > 0 && brandList[0] !== '') {
        query.brand = { $in: brandList };
      }
    }

    if (minPrice && maxPrice) {
      query.price = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }
    
    // ✨ THIS IS THE NEW SEARCH LOGIC
    if (keyword) {
      // Split the keyword string into an array of words
      const keywords = keyword.split(' ');

      // Create a regex condition for each word
      const keywordConditions = keywords.map(kw => ({
        $or: [
          { name: { $regex: kw, $options: "i" } },
          { brand: { $regex: kw, $options: "i" } },
          { description: { $regex: kw, $options: "i" } } // Optional: also search description
        ]
      }));

      // Use $and to ensure the product matches ALL the keywords
      query.$and = keywordConditions;
    }

    let sortOptions = {};
    if (sortBy === 'price-lh') {
      sortOptions.price = 1;
    } else if (sortBy === 'price-hl') {
      sortOptions.price = -1;
    } else {
      sortOptions.createdAt = -1;
    }
    
    const products = await Product.find(query)
      .populate("category")
      .sort(sortOptions);

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching filtered products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ... (keep all your other functions, like updateProductColor, getStyledLook, etc.)

export const updateProductColor = asyncHandler(async (req, res) => {
  try {
    const { color } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.color = color;
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to update color", error: error.message });
  }
});

export const getStyledLook = asyncHandler(async (req, res) => {
  const ML_SERVICE_URL = 'http://localhost:5001';
  try {
    const userImageFile = req.files.userImage;
    const { productId, stylePrompt } = req.body;

    const garment = await Product.findById(productId);
    if (!garment) {
      return res.status(404).json({ message: "Garment not found" });
    }

    const formData = new FormData();
    formData.append('user_image', userImageFile.data, { filename: userImageFile.name });
    formData.append('garment_image_path', garment.image);
    formData.append('garment_name', garment.name);
    formData.append('user_prompt', stylePrompt);

    const tryOnResponse = await axios.post(`${ML_SERVICE_URL}/api/try-on`, formData, {
      headers: { ...formData.getHeaders() }
    });

    const lookbookResponse = await axios.post(`${ML_SERVICE_URL}/api/lookbook`, {
      garment_name: garment.name,
      user_prompt: stylePrompt
    });

    res.status(200).json({
      success: true,
      tryOnUrl: tryOnResponse.data.tryOnImageUrl,
      lookbookUrl: lookbookResponse.data.lookbookImageUrl
    });

  } catch (error) {
    console.error("Error with ML service:", error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: "Failed to generate styled look." });
  }
});

const fetchUniqueBrands = asyncHandler(async (req, res) => {
    try {
        const brands = await Product.distinct("brand");
        res.status(200).json(brands.sort());
    } catch (error) {
        console.error("Error fetching unique brands:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  fetchUniqueBrands,
};