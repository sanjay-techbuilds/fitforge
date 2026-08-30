// migration_fix.js
//
// This script fixes the sizeChart data by adding the 'hips' field.
// ---------------------------------------------------------------------

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/productModel.js';
import Category from './models/categoryModel.js';

dotenv.config();

// The original chart data, which includes 'hips'
const CLOTHING_CHART_FIX = [
  { size: "S", height: [150, 165], chest: [80, 90], waist: [60, 70], hips: [85, 95] },
  { size: "M", height: [165, 175], chest: [90, 100], waist: [70, 80], hips: [95, 105] },
  { size: "L", height: [175, 185], chest: [100, 110], waist: [80, 90], hips: [105, 115] },
  { size: "XL", height: [185, 195], chest: [110, 120], waist: [90, 100], hips: [115, 125] },
  { size: "XXL", height: [195, 210], chest: [120, 130], waist: [100, 110], hips: [125, 135] },
];

const SHOE_CHART = [
  { size: "6", length: [24, 24.5] },
  { size: "7", length: [25, 25.4] },
  { size: "8", length: [26, 26.2] },
  { size: "9", length: [27, 27] },
  { size: "10", length: [27.5, 27.8] },
  { size: "11", length: [28, 28.8] },
  { size: "12", length: [29, 29.6] },
];

const fixCharts = async () => {
  try {
    await connectDB();
    console.log("Database connected...");

    // Find all products that are NOT shoes
    const categories = await Category.find({ name: { $ne: 'Shoes' } });
    const categoryIds = categories.map(c => c._id);
    
    const productsToFix = await Product.find({ 
      category: { $in: categoryIds }
    });

    if (productsToFix.length === 0) {
      console.log("No clothing products found to fix.");
      mongoose.disconnect();
      return;
    }

    console.log(`Found ${productsToFix.length} clothing products to update...`);
    let count = 0;

    for (const product of productsToFix) {
      // Just re-assign the full, correct chart
      product.sizeChart = CLOTHING_CHART_FIX; 
      await product.save();
      count++;
    }

    console.log(`\nFix Complete!`);
    console.log(`Successfully updated ${count} product size charts with 'hips' data.`);

  } catch (error) {
    console.error("\nFix script failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database disconnected.");
  }
};

fixCharts();