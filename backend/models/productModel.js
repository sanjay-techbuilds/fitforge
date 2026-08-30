import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

// --- 1. NEW: Schema for Inventory per Size ---
// This replaces the old countInStock and quantity fields
const inventorySchema = mongoose.Schema(
  {
    size: { type: String, required: true }, // e.g., "S", "M", "L", "6", "7"
    countInStock: { type: Number, required: true, default: 0 },
  },
  { _id: false } // No need for separate _id for each inventory entry
);

// --- 2. NEW: Schema for Measurement Chart per Size ---
// This will store the data we use for recommendation
const sizeMeasurementSchema = mongoose.Schema(
  {
    size: { type: String, required: true }, // "S", "M", "L"
    height: { type: [Number] }, // [150, 165]
    chest: { type: [Number] }, // [80, 90]
    waist: { type: [Number] }, // [60, 70]
    hips: { type: [Number] }, // [85, 95]
    length: { type: [Number] }, // For shoes, e.g., [24, 24.5]
  },
  { _id: false }
);

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    // --- 3. REPLACED 'quantity' and 'countInStock' ---
    inventory: [inventorySchema],
    // --- 4. ADDED 'sizeChart' ---
    sizeChart: [sizeMeasurementSchema],
    // -------------------------------------------------
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } // Enable virtuals
);

// --- 5. NEW: Virtual 'countInStock' ---
// This sums up all stock for compatibility with your frontend
// product.countInStock will now return the TOTAL stock
productSchema.virtual("countInStock").get(function () {
  return this.inventory.reduce((total, item) => total + item.countInStock, 0);
});

// --- 6. NEW: Virtual 'sizes' ---
// This creates the array of size names (e.g., ["S", "M", "L"])
// that your ProductDetails.jsx file expects
productSchema.virtual("sizes").get(function () {
  return this.inventory.map((item) => item.size);
});

const Product = mongoose.model("Product", productSchema);
export default Product;